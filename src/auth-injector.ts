import type { ProviderConfig, AuthInjectionResult } from './types.js'

export class AuthInjector {
  private authPattern: ProviderConfig['authPattern']
  private headerName?: string
  private queryParamName?: string
  
  constructor(config: Pick<ProviderConfig, 'authPattern' | 'headerName' | 'queryParamName'>) {
    this.authPattern = config.authPattern
    this.headerName = config.headerName
    this.queryParamName = config.queryParamName
  }
  
  /**
   * Inject key into HTTP headers or URL
   */
  inject(key: string, baseUrl: string): AuthInjectionResult {
    const headers: Record<string, string> = {}
    let url = baseUrl
    
    switch (this.authPattern) {
      case 'bearer':
        headers['Authorization'] = `Bearer ${key}`
        break
        
      case 'queryparam':
        if (!this.queryParamName) {
          throw new Error('queryParamName required for queryparam auth pattern')
        }
        const separator = url.includes('?') ? '&' : '?'
        url = `${url}${separator}${this.queryParamName}=${key}`
        break
        
      case 'customheader':
        if (!this.headerName) {
          throw new Error('headerName required for customheader auth pattern')
        }
        headers[this.headerName] = key
        break
    }
    
    return { url, headers }
  }
  
  /**
   * For query-param providers: rebuild URL with new key (for rotation)
   */
  updateKey(currentUrl: string, newKey: string): string {
    if (this.authPattern !== 'queryparam' || !this.queryParamName) {
      return currentUrl
    }
    
    const url = new URL(currentUrl)
    url.searchParams.set(this.queryParamName, newKey)
    return url.toString()
  }
}