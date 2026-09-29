import { ApiProperty } from '@nestjs/swagger';

export class MfaVerifyDto {
  @ApiProperty({
    example: '123456',
    description: 'Código de 6 dígitos do Google Authenticator',
  })
  codigo: string;
}