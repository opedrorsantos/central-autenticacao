import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'joao@email.com',
    description: 'E-mail do usuário',
  })
  email: string;

  @ApiProperty({
    example: 'Senha123!',
    description: 'Senha do usuário',
  })
  senha: string;
}