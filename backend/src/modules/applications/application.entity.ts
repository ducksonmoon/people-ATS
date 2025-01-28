import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../users/user.entity';
import { Job } from '../jobs/job.entity';

@ObjectType()
export class Application {
  @Field(() => Int)
  id: number;

  @Field(() => User)
  candidate: User;

  @Field(() => Job)
  job: Job;

  @Field()
  status: string;

  @Field()
  appliedAt: Date;
}
