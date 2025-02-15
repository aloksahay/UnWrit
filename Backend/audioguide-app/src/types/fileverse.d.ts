declare module '@fileverse/agents' {
  export class Agent {
    constructor(config: {
      chain: string;
      privateKey: string;
      pinataJWT: string;
      pinataGateway: string;
      pimlicoAPIKey: string;
    });

    setupStorage(namespace: string): Promise<void>;
    create(content: string): Promise<{ fileId: bigint; contentIpfsHash: string }>;
    getFile(fileId: bigint): Promise<{ 
      content: string; 
      contentIpfsHash: string;
      portal: string;
      namespace: string;
    } | null>;
    update(fileId: bigint, content: string): Promise<void>;
    delete(fileId: bigint): Promise<void>;
  }
} 