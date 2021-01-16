export interface IAttachment {
    id?: string;
    name: string;
    machineName: string;
    entityType: AttachmentEntityType;
    entityId: string;
    path: string | File;
    previewPath?: string;
    size: number;
    createdAt: Date;
    changedAt: Date;
}

export type AttachmentEntityType = 'occupations' | 'affiliates';
