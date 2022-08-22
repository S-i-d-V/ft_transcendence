import { HttpService } from '@nestjs/axios';
import { Injectable} from '@nestjs/common';
import { Relation, Social } from '@prisma/client';
import { DbService } from 'src/db/db.service';

@Injectable()
export class SocialService {

  constructor(private prisma: DbService, private http: HttpService) {}

  async getSocial(){
    const socialList = await this.prisma.social;
    return (socialList);
  }

  async getUserSocial(username: string){
    const userSocialList = await this.prisma.social.findUnique({
      where: { authorName: username }
    })
    return (userSocialList);
  }

  async addUserRelation(author: string, target: string, relation: Relation){
    const newRelation: Social = await this.prisma.social.create({
      data: {
        authorName: author,
        targetName: target,
        relation: relation,
      }
    });
    return (newRelation);
  }

}
