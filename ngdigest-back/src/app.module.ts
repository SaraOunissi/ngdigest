import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ResourcesModule } from './modules/resources/resources.module.js';
import { AggregatorModule } from './modules/aggregator/aggregator.module.js';
import { AuthModule } from './modules/auth/auth.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>(
          'MONGODB_URI',
          'mongodb://localhost:27017/ngdigest',
        ),
      }),
    }),
    ScheduleModule.forRoot(),
    ResourcesModule,
    AggregatorModule,
    AuthModule,
  ],
})
export class AppModule {}
