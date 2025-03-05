import { Test, TestingModule } from '@nestjs/testing';
import { HRService } from './hr.service';
import { PrismaService } from '../../common/prisma.service';

// Mock PrismaService for testing
const mockPrismaService = {
  hiringGoal: {
    findMany: jest.fn(),
    delete: jest.fn(),
  },
  completedHiringGoal: {
    create: jest.fn(),
  },
  department: {
    findMany: jest.fn(),
  },
  companySettings: {
    findFirst: jest.fn(),
  },
};

describe('HRService', () => {
  let service: HRService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HRService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<HRService>(HRService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset all mock implementations after each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('archiveExpiredHiringGoals', () => {
    it('should archive expired hiring goals', async () => {
      // Setup test data
      const now = new Date();
      const pastDate = new Date(now);
      pastDate.setMonth(pastDate.getMonth() - 2);

      const mockExpiredGoals = [
        {
          id: 1,
          departmentId: 1,
          targetHeadcount: 10,
          startDate: pastDate,
          endDate: pastDate,
          department: {
            id: 1,
            name: 'Engineering',
            employees: [
              { id: 1, name: 'Employee 1' },
              { id: 2, name: 'Employee 2' },
              { id: 3, name: 'Employee 3' },
              { id: 4, name: 'Employee 4' },
              { id: 5, name: 'Employee 5' },
              { id: 6, name: 'Employee 6' },
            ],
          },
        },
        {
          id: 2,
          departmentId: 2,
          targetHeadcount: 20,
          startDate: pastDate,
          endDate: pastDate,
          department: {
            id: 2,
            name: 'Marketing',
            employees: [
              { id: 7, name: 'Employee 7' },
              { id: 8, name: 'Employee 8' },
              { id: 9, name: 'Employee 9' },
            ],
          },
        },
      ];

      // Mock the prisma methods
      mockPrismaService.hiringGoal.findMany.mockResolvedValue(mockExpiredGoals);
      mockPrismaService.completedHiringGoal.create.mockResolvedValue({});
      mockPrismaService.hiringGoal.delete.mockResolvedValue({});

      // Call the method to be tested
      const result = await service.archiveExpiredHiringGoals(999); // Mock user ID

      // Assertions
      expect(mockPrismaService.hiringGoal.findMany).toHaveBeenCalledTimes(1);
      expect(
        mockPrismaService.completedHiringGoal.create,
      ).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.hiringGoal.delete).toHaveBeenCalledTimes(2);

      // Check the first create call
      expect(
        mockPrismaService.completedHiringGoal.create,
      ).toHaveBeenNthCalledWith(1, {
        data: {
          departmentId: 1,
          targetHeadcount: 10,
          actualHeadcount: 6,
          startDate: expect.any(Date),
          endDate: expect.any(Date),
          achieved: false, // 6 < 10
          notes: expect.stringContaining('not achieved'),
          year: expect.any(String),
          archivedBy: 999,
        },
      });

      // Check the second create call
      expect(
        mockPrismaService.completedHiringGoal.create,
      ).toHaveBeenNthCalledWith(2, {
        data: {
          departmentId: 2,
          targetHeadcount: 20,
          actualHeadcount: 3,
          startDate: expect.any(Date),
          endDate: expect.any(Date),
          achieved: false, // 3 < 20
          notes: expect.stringContaining('not achieved'),
          year: expect.any(String),
          archivedBy: 999,
        },
      });

      // Verify result
      expect(result).toEqual({
        archived: 2,
        message: 'Successfully archived 2 expired hiring goals',
      });
    });

    it('should return early if no expired goals are found', async () => {
      // Mock empty results
      mockPrismaService.hiringGoal.findMany.mockResolvedValue([]);

      // Call the method
      const result = await service.archiveExpiredHiringGoals();

      // Assertions
      expect(mockPrismaService.hiringGoal.findMany).toHaveBeenCalledTimes(1);
      expect(
        mockPrismaService.completedHiringGoal.create,
      ).not.toHaveBeenCalled();
      expect(mockPrismaService.hiringGoal.delete).not.toHaveBeenCalled();

      // Verify result for no goals
      expect(result).toEqual({
        archived: 0,
        message: 'No goals to archive',
      });
    });

    it('should mark goal as achieved when actual headcount meets or exceeds target', async () => {
      // Setup a goal that has been achieved
      const now = new Date();
      const pastDate = new Date(now);
      pastDate.setMonth(pastDate.getMonth() - 2);

      const mockAchievedGoal = [
        {
          id: 3,
          departmentId: 3,
          targetHeadcount: 5,
          startDate: pastDate,
          endDate: pastDate,
          department: {
            id: 3,
            name: 'Sales',
            employees: [
              { id: 10, name: 'Employee 10' },
              { id: 11, name: 'Employee 11' },
              { id: 12, name: 'Employee 12' },
              { id: 13, name: 'Employee 13' },
              { id: 14, name: 'Employee 14' },
              { id: 15, name: 'Employee 15' },
            ],
          },
        },
      ];

      // Mock the prisma methods
      mockPrismaService.hiringGoal.findMany.mockResolvedValue(mockAchievedGoal);
      mockPrismaService.completedHiringGoal.create.mockResolvedValue({});
      mockPrismaService.hiringGoal.delete.mockResolvedValue({});

      // Call the method to be tested
      const result = await service.archiveExpiredHiringGoals();

      // Assertions
      expect(mockPrismaService.completedHiringGoal.create).toHaveBeenCalledWith(
        {
          data: {
            departmentId: 3,
            targetHeadcount: 5,
            actualHeadcount: 6,
            startDate: expect.any(Date),
            endDate: expect.any(Date),
            achieved: true, // 6 > 5
            notes: expect.stringContaining('successfully achieved'),
            year: expect.any(String),
            archivedBy: null,
          },
        },
      );

      // Verify result
      expect(result).toEqual({
        archived: 1,
        message: 'Successfully archived 1 expired hiring goals',
      });
    });
  });
});
