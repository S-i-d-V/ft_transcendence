import { Controller, Get, Post, Query } from '@nestjs/common';
import { Relation } from '@prisma/client';
import { DbService } from 'src/db/db.service';
import { SocialService } from './social.service';

@Controller('social')
export class SocialController {
    constructor(private prismaClient: DbService, public socialService: SocialService) {
        //
    }

    @Get('')
    async getSocialList() {
        return { allRelations: this.socialService.getSocial() };
    }

    @Get('relations')
    async getUserRelations(@Query('username') username: string) {
        return { userRelations: this.socialService.getUserSocial(username) };
    }

    @Post('add')
    async addUserRelation(@Query('author') authorName: string, @Query('target') targetName: string, @Query('relation') relation: Relation) {
        console.log('author : ', authorName);
        console.log('target : ', targetName);
        console.log('relation : ', relation);
        return { newRelation: this.socialService.addUserRelation(authorName, targetName, relation) };
    }

}
