export declare function getOrCreateTenant(slug: string, name?: string): Promise<{
    status: string;
    name: string;
    id: string;
    slug: string;
    timezone: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}>;
