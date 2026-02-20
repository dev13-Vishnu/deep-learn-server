import { UserReaderPort } from './UserReaderPort';
import { UserWriterPort } from './UserWriterPort';

// Composite interface for backward compatibility
export interface UserRepositoryPort extends UserReaderPort, UserWriterPort {}