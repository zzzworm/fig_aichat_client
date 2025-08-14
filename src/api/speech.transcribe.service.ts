import ReactNativeBlobUtil from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import {
    TranscriptionResponse
} from './types/speechanalysis.types';

/**
 * Speech Analysis Service Class
 * Provides speech transcription and analysis functionality
 * Uses react-native-blob-util to optimize file upload performance
 */
class SpeechTranscribeService {
  private readonly baseUrl = process.env.EXPO_PUBLIC_ASR_SERVICE_URL || 'http://localhost:8011';

  /**
   * Speech Transcription Interface
   * @param audioUri Audio file URI
   * @returns Transcription result
   */
  async transcribe(audioUri: string): Promise<TranscriptionResponse> {
    try {
      // console.log('Starting speech transcription request:', {
      //   audioUri,
      //   baseUrl: this.baseUrl
      // });
      
      // Read file content
      const fileContent = await RNFS.readFile(audioUri, 'base64');
      
      // Get filename and MIME type
      const fileName = audioUri.split('/').pop() || 'recording.wav';
      const mimeType = this.getMimeType(fileName);
      console.log('baseUrl', this.baseUrl);
      // Send multipart/form-data request using react-native-blob-util
      const response = await ReactNativeBlobUtil.fetch(
        'POST',
        `${this.baseUrl}/transcribe`,
        {
          'Content-Type': 'multipart/form-data',
        },
        [
          // Add audio file field
          {
            name: 'audio_file',
            filename: fileName,
            type: mimeType,
            data: fileContent
          }
        ]
      );

            // console.log('Transcription request response status:', response.info().status);
      
      // Check response status
      if (response.info().status !== 200) {
        const errorText = await response.text();
        console.error('Transcription service returned error:', {
          status: response.info().status,
          error: errorText
        });
        throw new Error(`Speech transcription failed: HTTP ${response.info().status} - ${errorText}`);
      }

      // Parse response data
      const responseText = await response.text();
      const result: TranscriptionResponse = JSON.parse(responseText);
      
      // console.log('Speech transcription result:', {
      //   transcription: result.transcription,
      //   confidence: result.confidence,
      //   language: result.language,
      //   processing_time: result.processing_time
      // });

      return result;
    } catch (error) {
      console.error('Speech transcription failed:', error);
      
      // Handle network errors
      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          throw new Error('Network connection failed, please check network settings and server status');
        }
        
        if (error.message.includes('timeout')) {
          throw new Error('Transcription request timeout, please try again');
        }
        
        if (error.message.includes('ENOENT') || error.message.includes('file not found')) {
          throw new Error('Audio file does not exist or cannot be accessed');
        }
        
        if (error.message.includes('Invalid audio file format')) {
          throw new Error('Audio file format not supported, please use WAV, MP3, or M4A format');
        }
        
        if (error.message.includes('Empty audio file')) {
          throw new Error('Audio file is empty, please record again');
        }
        
        throw error;
      }
      
      throw new Error('Unknown error occurred during speech transcription');
    }
  }

  /**
   * Check if service is available
   * @returns Service status
   */
  async checkServiceHealth(): Promise<boolean> {
    try {
      const response = await ReactNativeBlobUtil.fetch(
        'GET',
        `${this.baseUrl}/health`,
        {
          'Content-Type': 'application/json',
        }
      );
      
      return response.info().status === 200;
    } catch (error) {
      console.error('Speech analysis service health check failed:', error);
      return false;
    }
  }

  /**
   * Get MIME type based on filename
   * @param fileName Filename
   * @returns MIME type
   */
  private getMimeType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'wav':
        return 'audio/wav';
      case 'mp3':
        return 'audio/mpeg';
      case 'm4a':
        return 'audio/mp4';
      case 'aac':
        return 'audio/aac';
      case 'ogg':
        return 'audio/ogg';
      case 'webm':
        return 'audio/webm';
      default:
        return 'audio/wav'; // Default to wav format
    }
  }
}

// Export singleton instance
export default new SpeechTranscribeService();
