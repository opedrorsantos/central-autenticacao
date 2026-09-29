import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {

    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIs...',
        description: 'Refresh Token recebido no login',
    })
    refreshToken: string;
}