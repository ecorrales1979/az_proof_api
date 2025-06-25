import listOrdersService from '../services/DashboardServices/ListOrdersService';

class DashboardsController {
    async index(req, res) {
        try {
            const filters = {};
            if (req.query.start_date) filters.start_date = req.query.start_date;
            if (req.query.end_date) filters.end_date = req.query.end_date;
            const pagination = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10
            };

            const result = await listOrdersService.run(pagination, filters);

            return res.status(200).json(result);
        } catch (error) {
            console.error('Error in OrderController.index:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}
export default new DashboardsController();
