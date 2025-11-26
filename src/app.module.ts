import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanguagesModule } from './languages/languages.module';
import { TagsModule } from './tags/tags.module';
import { CategoriesModule } from './categories/categories.module';
import { AcademicAchievementsModule } from './academic_achievements/academic_achievements.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { BannersModule } from './banners/banners.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number.parseInt(process.env.DB_PORT ?? '6432', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
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

  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule { }
