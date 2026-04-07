import { Controller, Post, Body, Get } from '@nestjs/common';
import { InterpreterService } from './interpreter.service';
import type { CompileRequest, CompileResponse } from './types/compiler.types';

@Controller('interpreter')
export class InterpreterController {

  constructor(private readonly interpreterService: InterpreterService) {}

  @Get('version')
  getVersion() {
    return { version: '1.0.0', status: 'ok' };
  }

  @Post('compile')
  compile(@Body() body: CompileRequest): CompileResponse {
    return this.interpreterService.compile(body);
  }
}
