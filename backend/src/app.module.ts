import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InterpreterModule } from './interpreter/interpreter.module';

@Module({
  imports: [InterpreterModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
