// Google Docs integration service
export interface GoogleDoc {
  id: string;
  name: string;
  content: string;
  lastModified: Date;
  url: string;
}

export interface GoogleDocsConfig {
  apiKey: string;
  clientId: string;
  scope: string;
}

class GoogleDocsService {
  private config: GoogleDocsConfig = {
    apiKey: '',
    clientId: '',
    scope: 'https://www.googleapis.com/auth/documents.readonly https://www.googleapis.com/auth/drive.readonly'
  };

  private accessToken: string | null = null;
  private isInitialized = false;

  // Initialize Google API
  async initialize(apiKey: string, clientId: string): Promise<void> {
    this.config.apiKey = apiKey;
    this.config.clientId = clientId;
    
    // Store config
    localStorage.setItem('google_docs_api_key', apiKey);
    localStorage.setItem('google_docs_client_id', clientId);
    
    this.isInitialized = true;
  }

  // Load saved config
  loadConfig(): void {
    const apiKey = localStorage.getItem('google_docs_api_key');
    const clientId = localStorage.getItem('google_docs_client_id');
    
    if (apiKey && clientId) {
      this.config.apiKey = apiKey;
      this.config.clientId = clientId;
      this.isInitialized = true;
    }
  }

  // Check if configured
  isConfigured(): boolean {
    return this.isInitialized && !!this.config.apiKey && !!this.config.clientId;
  }

  // Authenticate with Google
  async authenticate(): Promise<boolean> {
    if (!this.isConfigured()) {
      throw new Error('Google Docs not configured. Please add your API key and Client ID.');
    }

    try {
      // Load Google API
      await this.loadGoogleAPI();
      
      // Initialize auth
      await new Promise((resolve, reject) => {
        window.gapi.load('auth2', () => {
          window.gapi.auth2.init({
            client_id: this.config.clientId,
            scope: this.config.scope
          }).then(resolve, reject);
        });
      });

      // Sign in
      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      
      this.accessToken = user.getAuthResponse().access_token;
      return true;
    } catch (error) {
      console.error('Google authentication failed:', error);
      return false;
    }
  }

  // Load Google API script
  private async loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client:auth2', resolve);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Get list of Google Docs
  async getDocuments(): Promise<GoogleDoc[]> {
    if (!this.accessToken) {
      const authenticated = await this.authenticate();
      if (!authenticated) {
        throw new Error('Authentication failed');
      }
    }

    try {
      // Search for Google Docs
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.document'&fields=files(id,name,modifiedTime,webViewLink)`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      
      // Get content for each document
      const docs: GoogleDoc[] = [];
      for (const file of data.files.slice(0, 10)) { // Limit to 10 docs for performance
        try {
          const content = await this.getDocumentContent(file.id);
          docs.push({
            id: file.id,
            name: file.name,
            content,
            lastModified: new Date(file.modifiedTime),
            url: file.webViewLink
          });
        } catch (error) {
          console.warn(`Failed to get content for document ${file.name}:`, error);
        }
      }

      return docs;
    } catch (error) {
      console.error('Error fetching Google Docs:', error);
      throw error;
    }
  }

  // Get content of a specific document
  async getDocumentContent(documentId: string): Promise<string> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(
        `https://docs.googleapis.com/v1/documents/${documentId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch document content');
      }

      const doc = await response.json();
      
      // Extract text content from the document structure
      let content = '';
      if (doc.body && doc.body.content) {
        content = this.extractTextFromContent(doc.body.content);
      }

      return content;
    } catch (error) {
      console.error('Error fetching document content:', error);
      throw error;
    }
  }

  // Extract plain text from Google Docs content structure
  private extractTextFromContent(content: any[]): string {
    let text = '';
    
    for (const element of content) {
      if (element.paragraph) {
        for (const textElement of element.paragraph.elements || []) {
          if (textElement.textRun) {
            text += textElement.textRun.content;
          }
        }
      } else if (element.table) {
        // Handle tables
        for (const row of element.table.tableRows || []) {
          for (const cell of row.tableCells || []) {
            text += this.extractTextFromContent(cell.content || []);
          }
        }
      }
    }
    
    return text.trim();
  }

  // Import document content into a context profile
  async importToProfile(documentId: string, profileId: string): Promise<string> {
    const content = await this.getDocumentContent(documentId);
    
    // Store the imported content
    const importKey = `google_docs_import_${profileId}_${documentId}`;
    localStorage.setItem(importKey, JSON.stringify({
      content,
      importedAt: new Date().toISOString(),
      documentId
    }));
    
    return content;
  }

  // Get imported documents for a profile
  getImportedDocuments(profileId: string): Array<{documentId: string, content: string, importedAt: Date}> {
    const imports = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`google_docs_import_${profileId}_`)) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          imports.push({
            documentId: data.documentId,
            content: data.content,
            importedAt: new Date(data.importedAt)
          });
        } catch (error) {
          console.warn('Failed to parse imported document:', error);
        }
      }
    }
    
    return imports;
  }

  // Clear authentication
  signOut(): void {
    this.accessToken = null;
    if (window.gapi && window.gapi.auth2) {
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (authInstance) {
        authInstance.signOut();
      }
    }
  }
}

// Extend window interface for Google API
declare global {
  interface Window {
    gapi: any;
  }
}

export const googleDocsService = new GoogleDocsService();