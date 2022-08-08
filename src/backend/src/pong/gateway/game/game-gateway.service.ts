import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConnectedSocket } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { CustomGame } from 'src/pong/class/game-mode/custom-game/custom-game';
import { NormalGame } from 'src/pong/class/game-mode/normal-game/normal-game';
import { GameMode } from 'src/pong/interface/game-mode.interface';
import { Player } from '../../class/player/player';
import { Room } from '../../class/room/room';

@Injectable()
export class GameGatewayService {
  constructor(private jwtService: JwtService) {
    this.logger = new Logger('GameGateway');
  }

  private logger: Logger;

  findRoomId(rooms: Room[], client: Socket): Room {
    for (const room of rooms) {
      for (const player of room.players) {
        if (player.socket === client) return room;
      }
    }
    return;
  }

  findPlayer(room: Room, client: Socket): Player {
    for (const player of room.players) {
      if (player.socket === client) return player;
    }
    return;
  }

  clearRoom(roomToClear: Room, rooms: Room[]) {
    roomToClear.players[0].socket.leave(roomToClear.uuid);
    roomToClear.players[1].socket.leave(roomToClear.uuid);
    rooms.splice(
      rooms.findIndex((element) => element === roomToClear),
      1,
    );
    roomToClear.players[0].socket.disconnect();
    roomToClear.players[1].socket.disconnect();
  }

  checkJwtToken(@ConnectedSocket() client: Socket): boolean {
    try {
      this.jwtService.verify(client.handshake.auth.token, {
        secret: process.env['JWT_SECRET'],
      });
      return true;
    } catch (error) {
      this.logger.debug(error);
      client.disconnect();
    }
  }

  emitGameFinished(
    server: Server,
    roomUuid: string,
    winner: string,
    leaver?: string,
  ) {
    if (leaver != undefined)
      server
        .to(roomUuid)
        .emit('gameFinished', { username: winner }, { username: leaver });
    else server.to(roomUuid).emit('gameFinished', { username: winner });
  }

  private getGameMode(game: GameMode): string {
    if (game instanceof NormalGame) return 'normal';
    else if (game instanceof CustomGame) return 'custom';
    return 'ranked';
  }

  emitMatchFound(server: Server, newRoom: Room) {
    server.to(newRoom.uuid).emit(
      'matchFound',
      'A match has been found',
      this.getGameMode(newRoom.gameMode),
      {
        canvaHeight: newRoom.gameMode.canvaHeight,
        canvaWidth: newRoom.gameMode.canvaWidth,
        backgroundColor: newRoom.gameMode.backgroundColor,
        ballRadius: newRoom.gameMode.ball.radius,
        ballColor: newRoom.gameMode.ball.color,
      },
      {
        height: newRoom.players[0].height,
        width: newRoom.players[0].width,
        playerOneColor: newRoom.players[0].color,
        playerTwoColor: newRoom.players[1].color,
        playerOneUsername: newRoom.players[0].username,
        playerTwoUsername: newRoom.players[1].username,
      },
    );
  }
}
