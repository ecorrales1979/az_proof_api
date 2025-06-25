import { OrderStatusEnum } from '../../enums/OrderStatusEnum';
import Order from '../../models/Order';

const VALID_SALE_STATUSES = [OrderStatusEnum.PAID];

class ListOrderServices {
    /**
     * Busca pedidos com estatísticas resumidas e paginação
     *
     * @param {{ page: number, limit: number }} pagination  - Objeto de paginação.
     * @param {{ start_date: string, end_date: string }} filters  - Objeto contendo os filtros.
     * @returns {Promise<{
     *     orders_total: number,
     *     orders_count: number,
     *     sales_total: number,
     *     sales_count: number,
     *     average_ticket: number,
     *     orders: Order[],
     *     has_more: boolean,
     *     limit: number,
     *     page: number,
     *     total: number,
     *     total_pages: number
     * }>} Resultado contendo os pedidos e metadados.
     */
    async run(pagination, filters) {
        const stats = await this.#getStats();

        const paginatedOrders = await this.#getPaginatedOrders(
            pagination,
            filters
        );

        return {
            orders_total: stats.totalOrderAmount,
            orders_count: stats.totalOrders,
            sales_total: stats.totalSalesAmount,
            sales_count: stats.totalSales,
            average_ticket: stats.averageSaleAmount,
            orders: paginatedOrders.orders,
            has_more: paginatedOrders.hasMore,
            limit: pagination.limit,
            total_pages: paginatedOrders.totalPages,
            page: pagination.page,
            total: paginatedOrders.total
        };
    }

    /**
     * Obtém metadados de todos os pedidos
     *
     * @returns {Promise<{
     *     totalOrderAmount: number,
     *     totalOrders: number,
     *     totalSalesAmount: number,
     *     totalSales: number,
     *     averageSaleAmount: number
     * }>} Resultado contendo metadados dos pedidos
     */
    async #getStats() {
        const [stats] = await Order.aggregate([
            {
                $facet: {
                    totalOrders: [{ $count: 'count' }],
                    totalOrderAmount: [
                        {
                            $group: {
                                _id: null,
                                sum: { $sum: '$payment.amount' }
                            }
                        }
                    ],
                    totalSales: [
                        { $match: { status: { $in: VALID_SALE_STATUSES } } },
                        { $count: 'count' }
                    ],
                    totalSalesAmount: [
                        { $match: { status: { $in: VALID_SALE_STATUSES } } },
                        {
                            $group: {
                                _id: null,
                                sum: { $sum: '$payment.amount' }
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    totalOrders: { $arrayElemAt: ['$totalOrders.count', 0] },
                    totalOrderAmount: {
                        $round: [
                            {
                                $ifNull: [
                                    {
                                        $arrayElemAt: [
                                            '$totalOrderAmount.sum',
                                            0
                                        ]
                                    },
                                    0
                                ]
                            },
                            2
                        ]
                    },
                    totalSales: { $arrayElemAt: ['$totalSales.count', 0] },
                    totalSalesAmount: {
                        $round: [
                            {
                                $ifNull: [
                                    {
                                        $arrayElemAt: [
                                            '$totalSalesAmount.sum',
                                            0
                                        ]
                                    },
                                    0
                                ]
                            },
                            2
                        ]
                    }
                }
            },
            {
                $addFields: {
                    averageSaleAmount: {
                        $cond: [
                            { $gt: ['$totalSales', 0] },
                            {
                                $round: [
                                    {
                                        $divide: [
                                            '$totalSalesAmount',
                                            '$totalSales'
                                        ]
                                    },
                                    2
                                ]
                            },
                            0
                        ]
                    }
                }
            }
        ]);

        return stats;
    }

    /**
     *
     * @param {{ page: number, limit: number }} pagination
     * @param {{ start_date: string, end_date: string }} filters
     * @returns {Promise<{
     *     orders: Order[],
     *     total: number,
     *     totaPages: number,
     *     hasmore: boolean
     * }>}
     */
    async #getPaginatedOrders(pagination, filters) {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;

        const queryFilters = {};
        if (filters.start_date || filters.end_date) {
            queryFilters.createdAt = {};

            if (filters.start_date) {
                queryFilters.createdAt.$gte = new Date(filters.start_date);
            }

            if (query.end_date) {
                const end = new Date(query.end_date);
                end.setUTCHours(23, 59, 59, 999);
                filters.createdAt.$lte = end;
            }
        }

        const filteredTotal = await Order.countDocuments(filters);

        const orders = await Order.find(filters)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        const totalPages = Math.ceil(filteredTotal / limit);
        const hasMore = page < totalPages;

        return {
            orders,
            total: filteredTotal,
            totalPages,
            hasMore
        };
    }
}

export default new ListOrderServices();
