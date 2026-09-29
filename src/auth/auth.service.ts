import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

import {
    generateSecret,
    generateURI,
    verify,
} from 'otplib';

import * as QRCode from 'qrcode';

import { RegisterDto } from './dto/register.dto';


@Injectable()
export class AuthService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }


    // ==========================================
    // CADASTRO
    // ==========================================

    async register(dto: RegisterDto) {

        const usuarioExistente =
            await this.prisma.usuario.findUnique({
                where: {
                    email: dto.email,
                },
            });


        if (usuarioExistente) {
            throw new UnauthorizedException(
                'E-mail já cadastrado',
            );
        }


        const senhaHash =
            await bcrypt.hash(
                dto.senha,
                10,
            );


        const usuario =
            await this.prisma.usuario.create({
                data: {
                    email: dto.email,
                    senha: senhaHash,
                },
            });


        return {
            mensagem:
                'Usuário cadastrado com sucesso',

            usuario: {
                id: usuario.id,
                email: usuario.email,
            },
        };
    }


    // ==========================================
    // LOGIN
    // ==========================================

    async login(
        email: string,
        senha: string,
    ) {

        const usuario =
            await this.prisma.usuario.findUnique({
                where: {
                    email: email,
                },
            });


        if (!usuario) {
            throw new UnauthorizedException(
                'E-mail ou senha inválidos',
            );
        }


        const senhaValida =
            await bcrypt.compare(
                senha,
                usuario.senha,
            );


        if (!senhaValida) {
            throw new UnauthorizedException(
                'E-mail ou senha inválidos',
            );
        }


        const payload = {
            sub: usuario.id,
            email: usuario.email,
        };


        // ==========================================
        // ACCESS TOKEN
        // ==========================================

        const accessToken =
            await this.jwtService.signAsync(
                payload,
            );


        // ==========================================
        // REFRESH TOKEN
        // ==========================================

        const refreshToken =
            await this.jwtService.signAsync(
                payload,
                {
                    secret:
                        process.env.JWT_REFRESH_SECRET,

                    expiresIn: '7d',
                },
            );


        // ==========================================
        // SALVAR HASH DO REFRESH TOKEN
        // ==========================================

        const refreshTokenHash =
            await bcrypt.hash(
                refreshToken,
                10,
            );


        await this.prisma.usuario.update({
            where: {
                id: usuario.id,
            },

            data: {
                refreshTokenHash:
                    refreshTokenHash,
            },
        });


        return {
            accessToken,
            refreshToken,
        };
    }


    // ==========================================
    // REFRESH TOKEN
    // ==========================================

    async refresh(
        refreshToken: string,
    ) {

        // Verifica se o Refresh Token foi enviado
        if (!refreshToken) {
            throw new UnauthorizedException(
                'Refresh Token não informado',
            );
        }


        // ==========================================
        // VERIFICAR ASSINATURA E EXPIRAÇÃO
        // ==========================================

        let payload: {
            sub: number;
            email: string;
        };


        try {

            payload =
                await this.jwtService.verifyAsync(
                    refreshToken,
                    {
                        secret:
                            process.env.JWT_REFRESH_SECRET,
                    },
                );

        } catch {

            throw new UnauthorizedException(
                'Refresh Token inválido ou expirado',
            );
        }


        // ==========================================
        // BUSCAR USUÁRIO
        // ==========================================

        const usuario =
            await this.prisma.usuario.findUnique({
                where: {
                    id: payload.sub,
                },
            });


        if (!usuario) {
            throw new UnauthorizedException(
                'Usuário não encontrado',
            );
        }


        // ==========================================
        // VERIFICAR HASH DO REFRESH TOKEN
        // ==========================================

        if (!usuario.refreshTokenHash) {
            throw new UnauthorizedException(
                'Refresh Token não encontrado',
            );
        }


        const tokenValido =
            await bcrypt.compare(
                refreshToken,
                usuario.refreshTokenHash,
            );


        if (!tokenValido) {
            throw new UnauthorizedException(
                'Refresh Token inválido',
            );
        }


        // ==========================================
        // NOVO PAYLOAD
        // ==========================================

        const novoPayload = {
            sub: usuario.id,
            email: usuario.email,
        };


        // ==========================================
        // NOVO ACCESS TOKEN
        // ==========================================

        const novoAccessToken =
            await this.jwtService.signAsync(
                novoPayload,
            );


        // ==========================================
        // NOVO REFRESH TOKEN
        // ==========================================

        const novoRefreshToken =
            await this.jwtService.signAsync(
                novoPayload,
                {
                    secret:
                        process.env.JWT_REFRESH_SECRET,

                    expiresIn: '7d',
                },
            );


        // ==========================================
        // ATUALIZAR HASH DO REFRESH TOKEN
        // ==========================================

        const novoRefreshTokenHash =
            await bcrypt.hash(
                novoRefreshToken,
                10,
            );


        await this.prisma.usuario.update({
            where: {
                id: usuario.id,
            },

            data: {
                refreshTokenHash:
                    novoRefreshTokenHash,
            },
        });


        // ==========================================
        // RETORNO
        // ==========================================

        return {
            accessToken:
                novoAccessToken,

            refreshToken:
                novoRefreshToken,
        };
    }


    // ==========================================
    // CONFIGURAR MFA
    // ==========================================

    async configurarMfa(
        usuarioId: number,
    ) {

        const usuario =
            await this.prisma.usuario.findUnique({
                where: {
                    id: usuarioId,
                },
            });


        if (!usuario) {
            throw new UnauthorizedException(
                'Usuário não encontrado',
            );
        }


        // Gera o segredo do autenticador
        const secret =
            generateSecret();


        // Gera a configuração TOTP
        const uri =
            generateURI({
                issuer:
                    'Central de Autenticacao Segura',

                label:
                    usuario.email,

                secret:
                    secret,
            });


        // Gera o QR Code
        const qrCode =
            await QRCode.toDataURL(uri);


        // Salva o segredo no banco
        await this.prisma.usuario.update({
            where: {
                id: usuario.id,
            },

            data: {
                mfaSecret: secret,
                mfaAtivo: false,
            },
        });


        return {
            mensagem:
                'MFA configurado. Escaneie o QR Code no Google Authenticator.',

            qrCode:
                qrCode,
        };
    }


    // ==========================================
    // VERIFICAR MFA
    // ==========================================

    async verificarMfa(
        usuarioId: number,
        codigo: string,
    ) {

        const usuario =
            await this.prisma.usuario.findUnique({
                where: {
                    id: usuarioId,
                },
            });


        if (!usuario) {
            throw new UnauthorizedException(
                'Usuário não encontrado',
            );
        }


        if (!usuario.mfaSecret) {
            throw new UnauthorizedException(
                'MFA não configurado',
            );
        }


        if (!/^\d{6}$/.test(codigo)) {
            throw new UnauthorizedException(
                'O código MFA deve possuir 6 dígitos',
            );
        }


        const resultado =
            await verify({
                secret:
                    usuario.mfaSecret,

                token:
                    codigo,
            });


        if (!resultado.valid) {
            throw new UnauthorizedException(
                'Código MFA inválido ou expirado',
            );
        }


        await this.prisma.usuario.update({
            where: {
                id: usuario.id,
            },

            data: {
                mfaAtivo: true,
            },
        });


        return {
            mensagem:
                'MFA ativado com sucesso',

            mfaAtivo:
                true,
        };
    }
}