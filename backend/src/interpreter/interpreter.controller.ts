import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { InterpreterService } from './interpreter.service';


@Controller('interpreter')
export class InterpreterController {
    constructor(private readonly interpreterService: InterpreterService) {}


    @Get('version')
    getVersion() {
        return { version: '1.0.0' };
    }
}