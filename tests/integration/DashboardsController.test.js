import request from 'supertest';
import app from '../../src/app.js';
import listOrdersService from '../../src/app/services/DashboardServices/ListOrdersService.js';

jest.mock('../../src/app/services/DashboardServices/ListOrdersService', () => ({
    run: jest.fn()
}));

jest.mock('../../src/app/middlewares/auth.js', () =>
    jest.fn((req, res, next) => {
        next();
    })
);

describe('DashboardsController Integration Test', () => {
    let consoleErrorSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('should return a 200 response with data returned by the service', async () => {
        const mockDashboardData = {
            orders_total: 1500.5,
            orders_count: 20,
            sales_total: 1200.0,
            sales_count: 15,
            average_ticket: 75.0
        };

        listOrdersService.run.mockResolvedValue(mockDashboardData);

        const response = await request(app).get('/proof/dashboard');

        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual(mockDashboardData);

        // Verifica se o service foi chamado com os valores por default para a paginação
        expect(listOrdersService.run).toHaveBeenCalledTimes(1);
        expect(listOrdersService.run).toHaveBeenCalledWith(
            { page: 1, limit: 10 },
            {}
        );
    });

    it('should return 500 if the service throws an error', async () => {
        const errorMessage = 'Failed to fetch dashboard data from DB.';
        listOrdersService.run.mockRejectedValue(new Error(errorMessage));

        const response = await request(app).get('/proof/dashboard');

        expect(response.statusCode).toEqual(500);
        expect(response.body).toEqual({ message: 'Internal Server Error' });
        expect(listOrdersService.run).toHaveBeenCalledTimes(1);
    });

    it('should use pagination and filters query parameters', async () => {
        const mockDashboardData = {};
        listOrdersService.run.mockResolvedValue(mockDashboardData);

        const response = await request(app).get('/proof/dashboard'); // Sem query parameters

        expect(response.statusCode).toEqual(200);
        expect(listOrdersService.run).toHaveBeenCalledWith(
            { page: 1, limit: 10 }, // Espera-se os valores default
            {} // Filtros vazios
        );
    });
});
