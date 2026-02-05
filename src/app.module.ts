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
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
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

  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule { }
