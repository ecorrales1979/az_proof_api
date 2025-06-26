import listOrdersService from '../../src/app/services/DashboardServices/ListOrdersService';
import Order from '../../src/app/models/Order';

let mockFindChain;

jest.mock('../../src/app/models/Order', () => {
    return {
        aggregate: jest.fn(() => ({
            exec: jest.fn()
        })),
        countDocuments: jest.fn(),
        find: jest.fn(() => ({
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            lean: jest.fn()
        }))
    };
});

describe('ListOrderService', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockFindChain = {
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            lean: jest.fn().mockReturnThis(),
            exec: jest.fn()
        };
        Order.find.mockReturnValue(mockFindChain);
        Order.aggregate.mockReturnValue({ exec: jest.fn() });
        Order.countDocuments.mockReturnValue({ exec: jest.fn() });
    });

    it('should return orders, metadata and pagination information', async () => {
        // Mocka a obtenção dos agregados
        const mockStatsResult = {
            totalOrders: 10,
            totalOrderAmount: 1000,
            totalSales: 5,
            totalSalesAmount: 750,
            averageSaleAmount: 150
        };
        Order.aggregate.mockReturnValue({
            exec: jest.fn().mockResolvedValue([mockStatsResult])
        });

        // Mocka a contagem antes da paginação
        const mockFilteredTotal = 50;
        Order.countDocuments.mockResolvedValue(mockFilteredTotal);

        // Mocka a obtenção dos pedidos
        const mockOrders = [{ _id: 'order-1' }, { _id: 'order-2' }];
        mockFindChain.exec.mockResolvedValue(mockOrders);

        const pagination = { page: 2, limit: 10 };
        const result = await listOrdersService.run(pagination, {});

        expect(Order.aggregate).toHaveBeenCalledTimes(1);
        expect(Order.countDocuments).toHaveBeenCalledTimes(1);
        expect(Order.find).toHaveBeenCalledTimes(1);
        expect(Order.find().skip).toHaveBeenCalledWith(10);
        expect(Order.find().limit).toHaveBeenCalledWith(10);
        expect(Order.find().sort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(Order.find().lean).toHaveBeenCalledTimes(1);

        expect(result).toEqual({
            orders_total: mockStatsResult.totalOrderAmount,
            orders_count: mockStatsResult.totalOrders,
            sales_total: mockStatsResult.totalSalesAmount,
            sales_count: mockStatsResult.totalSales,
            average_ticket: mockStatsResult.averageSaleAmount,
            orders: mockOrders,
            has_more: true,
            limit: pagination.limit,
            page: pagination.page,
            total: mockFilteredTotal,
            total_pages: 5
        });
    });

    it('throw an error if metadata search fails', async () => {
        const mockError = new Error('Database connection failed');
        Order.aggregate.mockReturnValue({
            exec: jest.fn().mockRejectedValue(mockError)
        });

        await expect(listOrdersService.run({}, {})).rejects.toThrow(
            'Database connection failed'
        );

        expect(Order.aggregate).toHaveBeenCalledTimes(1);
        expect(Order.countDocuments).not.toHaveBeenCalled();
        expect(Order.find).not.toHaveBeenCalled();
    });
});
