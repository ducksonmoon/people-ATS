import { InputType, Field, Int } from '@nestjs/graphql';

/**
 * DTO for creating a new application
 */
@InputType()
export class CreateApplicationInput {
  @Field(() => Int)
  candidateId: number;

  @Field(() => Int)
  jobId: number;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  resumePath?: string;
}

/**
 * DTO for updating application status
 */
@InputType()
export class UpdateApplicationStatusInput {
  @Field()
  status: string;

  @Field({ nullable: true })
  note?: string;
}

/**
 * DTO for filtering applications
 */
@InputType()
export class ApplicationFiltersInput {
  @Field({ nullable: true })
  status?: string;

  @Field(() => Int, { nullable: true })
  jobId?: number;

  @Field({ nullable: true })
  minDate?: Date;

  @Field({ nullable: true })
  maxDate?: Date;
}
