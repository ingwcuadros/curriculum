import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PdfResource } from './entities/pdf.entity';
import { StorageModule } from '../comon/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PdfResource]), StorageModule
  ],
  controllers: [PdfController],
  providers: [PdfService],
})
export class PdfModule { }
