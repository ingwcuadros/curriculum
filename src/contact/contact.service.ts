import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {

  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) { }


  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const message = this.contactRepository.create(createContactDto);
    return this.contactRepository.save(message);
  }

  async findAll(): Promise<Contact[]> {
    return this.contactRepository.find({
      order: { createdAt: 'DESC' }, // opcional, ordena los más recientes primero
    });
  }

  async findOne(id: string): Promise<Contact> {
    const message = await this.contactRepository.findOne({ where: { id } });

    if (!message) {
      throw new NotFoundException(`Contact message with id "${id}" not found`);
    }

    return message;
  }

  async remove(id: string): Promise<void> {
    const result = await this.contactRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Contact message with id "${id}" not found`);
    }
  }

}
