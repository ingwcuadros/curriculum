import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanguagesModule } from './languages/languages.module';
import { TagsModule } from './tags/tags.module';
import { CategoriesModule } from './categories/categories.module';
import { AcademicAchievementsModule } from './academic_achievements/academic_achievements.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { BannersModule } from './banners/banners.module';
import { ArticlesModule } from './articles/articles.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { PdfModule } from './pdf/pdf.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { ContactModule } from './contact/contact.module';
import typeorm from './config/typeorm';





@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm]
    }
    ),


    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: process.env.DB_URL, // o config.get('DB_URL')
        autoLoadEntities: true,
        synchronize: false,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),


    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    LanguagesModule,
    TagsModule,
    CategoriesModule,
    AcademicAchievementsModule,
    BannersModule,
    ArticlesModule,
    ExperiencesModule,
    PdfModule,
    UsersModule,
    AuthModule,
    RedisModule,
    ContactModule,

  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule { }
