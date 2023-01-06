// import { Inject, Injectable } from '@nestjs/common';
// import {
//   ValidationArguments,
//   ValidatorConstraint,
//   ValidatorConstraintInterface,
// } from 'class-validator';
// import { IBlogsRepository } from '../modules/public/blogs/infrastructure/blogs-repository.interface';
//
// @ValidatorConstraint({ name: 'BlogExists', async: true })
// @Injectable()
// export class BlogExistValidator implements ValidatorConstraintInterface {
//   constructor(
//     @Inject(IBlogsRepository) protected blogsRepository: IBlogsRepository,
//   ) {}
//
//   async validate(blogId: string) {
//     try {
//       const blog = await this.blogsRepository.getBlogById(blogId);
//       if (!blog) return false;
//       return true;
//     } catch (e) {
//       return false;
//     }
//   }
//
//   defaultMessage(args: ValidationArguments) {
//     return "Blog doesn't exist";
//   }
// }
