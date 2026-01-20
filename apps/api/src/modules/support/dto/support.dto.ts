import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsArray,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TicketCategory, TicketPriority, TicketStatus } from '@prisma/client';

export class CreateTicketDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  subject: string;

  @IsEnum(TicketCategory)
  category: TicketCategory;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message: string;

  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @IsUUID()
  tradeId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

export class AddTicketMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}

export class UpdateTicketStatusDto {
  @IsEnum(TicketStatus)
  status: TicketStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class AssignTicketDto {
  @IsUUID()
  assigneeId: string;
}

export class TicketMessageResponseDto {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  isInternal: boolean;
  attachments: string[];
  createdAt: Date;
}

export class TicketResponseDto {
  id: string;
  ticketNumber: string;
  creatorId: string;
  creatorName: string;
  assigneeId?: string;
  assigneeName?: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  orderId?: string;
  tradeId?: string;
  messages?: TicketMessageResponseDto[];
  messageCount: number;
  resolvedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class TicketListResponseDto {
  tickets: TicketResponseDto[];
  total: number;
  page: number;
  pageSize: number;
}

export class TicketStatsDto {
  total: number;
  open: number;
  inProgress: number;
  waitingCustomer: number;
  resolved: number;
  closed: number;
  avgResolutionTimeHours: number;
}
