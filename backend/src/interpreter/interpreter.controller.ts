import { Controller, Post, Body, Get } from '@nestjs/common';
import { InterpreterService } from './interpreter.service';
import type { CompileRequest, CompileResponse } from './types/compiler.types';

@Controller('interpreter')
export class InterpreterController {

  constructor(private readonly interpreterService: InterpreterService) {}

  /** Health check — útil para verificar que el backend está vivo */
  @Get('version')
  getVersion() {
    return { version: '1.0.0', status: 'ok' };
  }

  /**
   * POST /interpreter/compile
   * Body: { code: string }
   * Response: CompileResponse
   */
  @Post('compile')
  compile(@Body() body: CompileRequest): CompileResponse {
    return this.interpreterService.compile(body);
  }
}
