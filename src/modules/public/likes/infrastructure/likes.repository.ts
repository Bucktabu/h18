import { Injectable } from '@nestjs/common';
import { Like, LikeDocument } from './entity/likes.scheme';
import { NewestLikesModel } from './entity/newestLikes.model';
import { LikesModel } from './entity/likes.model';
import { ILikesRepository } from './likes-repository.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class LikesRepository implements ILikesRepository {
  constructor(
    @InjectModel(Like.name) private likesRepository: Model<LikeDocument>,
  ) {}

  async getUserReaction(
    parentId: string,
    userId: string,
  ): Promise<LikesModel | null> {
    try {
      return this.likesRepository
        .findOne(
          { parentId, userId, isBanned: false },
          { _id: false, parentId: false, userId: false, __v: false },
        )
        .lean();
    } catch (e) {
      return null;
    }
  }

  async getNewestLikes(parentId: string): Promise<NewestLikesModel[] | null> {
    try {
      return this.likesRepository
        .find(
          { parentId, status: 'Like', isBanned: false },
          { _id: false, parentId: false, status: false, __v: false },
        )
        .sort({ addedAt: -1 })
        .limit(3)
        .lean();
    } catch (e) {
      return null;
    }
  }

  async getLikeReactionsCount(parentId: string): Promise<number> {
    return this.likesRepository.countDocuments({
      parentId,
      status: 'Like',
      isBanned: false,
    });
  }
  async getDislikeReactionsCount(parentId: string): Promise<number> {
    return this.likesRepository.countDocuments({
      parentId,
      status: 'Dislike',
      isBanned: false,
    });
  }

  async updateUserReaction(
    commentId: string,
    userId: string,
    status: string,
    addedAt: string,
    login?: string,
  ): Promise<boolean> {
    try {
      await this.likesRepository.updateOne(
        { parentId: commentId, userId, login },
        { $set: { status, addedAt } },
        { upsert: true },
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  async updateBanStatus(userId: string, isBanned: boolean): Promise<boolean> {
    try {
      await this.likesRepository.updateOne({ userId }, { $set: { isBanned } });
      return true;
    } catch (e) {
      return false;
    }
  }
}
