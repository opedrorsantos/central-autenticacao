import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {

    @ApiProperty({
        example: 'joao@email.com',
        description: 'E-mail cadastrado do usuário',
    })
    email: string;

    @ApiProperty({
        example: 'Senha123!',
        description: 'Senha cadastrada do usuário',
    })
    senha: string;
}