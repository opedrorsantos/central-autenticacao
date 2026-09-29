import {
    Body,
    Controller,
    Get,
    Post,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { MfaVerifyDto } from './dto/mfa-verify.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';


@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
    ) { }


    // ==========================================
    // TESTE
    // ==========================================

    @Get()
    teste() {
        return {
            mensagem:
                'Controller de autenticação funcionando',
        };
    }


    // ==========================================
    // CADASTRO
    // ==========================================

    @Post('register')
    async register(
        @Body() dto: RegisterDto,
    ) {
        return this.authService.register(dto);
    }


    // ==========================================
    // LOGIN
    // ==========================================

    @Post('login')
    async login(
        @Body() dto: LoginDto,
    ) {
        return this.authService.login(
            dto.email,
            dto.senha,
        );
    }


    // ==========================================
    // REFRESH TOKEN
    // ==========================================

    @Post('refresh')
    async refresh(
        @Body() dto: RefreshDto,
    ) {
        return this.authService.refresh(
            dto.refreshToken,
        );
    }


    // ==========================================
    // CONFIGURAR MFA
    // ==========================================

    @Post('mfa/setup')
    async configurarMfa() {

        // Temporariamente utilizando o usuário de ID 1
        const usuarioId = 1;

        return this.authService.configurarMfa(
            usuarioId,
        );
    }


    // ==========================================
    // VERIFICAR MFA
    // ==========================================

    @Post('mfa/verify')
    async verificarMfa(
        @Body() body: MfaVerifyDto,
    ) {

        // Temporariamente utilizando o usuário de ID 1
        const usuarioId = 1;

        return this.authService.verificarMfa(
            usuarioId,
            body.codigo,
        );
    }
}