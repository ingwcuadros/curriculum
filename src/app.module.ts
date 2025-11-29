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





@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: 6432,
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // ⚠️ Solo en desarrollo
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

  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule { }
