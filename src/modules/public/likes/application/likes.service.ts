import { Inject, Injectable } from '@nestjs/common';
import { LikesRepository } from '../infrastructure/likes.repository';
import { NewestLikesModel } from '../infrastructure/entity/newestLikes.model';
import { ILikesRepository } from '../infrastructure/likes-repository.interface';

@Injectable()
export class LikesService {
  constructor(
    @Inject(ILikesRepository) protected likesRepository: ILikesRepository,
  ) {}

  async getNewestLikes(parentId: string): Promise<NewestLikesModel[] | null> {
    return this.likesRepository.getNewestLikes(parentId);
  }

  async getReactionAndReactionCount(id: string, userId: string) {
    let reaction = 'None';
    if (userId) {
      const result = await this.likesRepository.getUserReaction(id, userId);
      if (result) {
        reaction = result.status;
      }
    }

    const likesCount = await this.likesRepository.getLikeReactionsCount(id);
    const dislikesCount = await this.likesRepository.getDislikeReactionsCount(
      id,
    );

    return { reaction, likesCount, dislikesCount };
  }

  async updateUserReaction(
    commentId: string,
    userId: string,
    status: string,
    addedAt: string,
    login?: string,
  ): Promise<boolean> {
    return this.likesRepository.updateUserReaction(
      commentId,
      userId,
      status,
      addedAt,
      login,
    );
  }
}
