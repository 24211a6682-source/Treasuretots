interface CloudinaryUploadWidgetResult {
  event: string;
  info: {
    secure_url: string;
    public_id: string;
    original_filename: string;
    format: string;
    width: number;
    height: number;
  };
}

interface CloudinaryWidget {
  open: () => void;
  close: () => void;
  destroy: () => void;
}

interface CloudinaryUploadWidgetOptions {
  cloudName: string;
  uploadPreset: string;
  folder?: string;
  sources?: string[];
  multiple?: boolean;
  resourceType?: string;
  cropping?: boolean;
  maxFileSize?: number;
  clientAllowedFormats?: string[];
  showPoweredBy?: boolean;
  styles?: Record<string, unknown>;
}

interface Window {
  cloudinary?: {
    openUploadWidget: (
      options: CloudinaryUploadWidgetOptions,
      callback: (error: unknown, result: CloudinaryUploadWidgetResult) => void
    ) => CloudinaryWidget;
    createUploadWidget: (
      options: CloudinaryUploadWidgetOptions,
      callback: (error: unknown, result: CloudinaryUploadWidgetResult) => void
    ) => CloudinaryWidget;
  };
}
