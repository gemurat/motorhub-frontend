
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.CashBoxMovementsScalarFieldEnum = {
  id: 'id',
  cash_box_id: 'cash_box_id',
  store_id: 'store_id',
  type: 'type',
  amount: 'amount',
  description: 'description',
  date: 'date',
  order_id: 'order_id',
  status: 'status',
  created_by: 'created_by',
  approved_by: 'approved_by',
  approval_date: 'approval_date',
  rejection_reason: 'rejection_reason'
};

exports.Prisma.CashBoxesScalarFieldEnum = {
  id: 'id',
  store_id: 'store_id',
  name: 'name',
  current_balance: 'current_balance',
  last_updated: 'last_updated',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ClientsScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  phone: 'phone'
};

exports.Prisma.GiftCardsScalarFieldEnum = {
  id: 'id',
  code: 'code',
  customer_id: 'customer_id',
  balance: 'balance',
  issue_date: 'issue_date',
  expiry_date: 'expiry_date',
  status: 'status'
};

exports.Prisma.LocalOrderItemsScalarFieldEnum = {
  id: 'id',
  product_id: 'product_id',
  quantity: 'quantity',
  unit_price: 'unit_price'
};

exports.Prisma.LocalOrdersScalarFieldEnum = {
  id: 'id',
  store_id: 'store_id',
  order_date: 'order_date',
  supplier_id: 'supplier_id',
  total_amount: 'total_amount',
  status: 'status',
  vale: 'vale'
};

exports.Prisma.OrderItemsScalarFieldEnum = {
  id: 'id',
  order_id: 'order_id',
  product_id: 'product_id',
  quantity: 'quantity',
  price: 'price'
};

exports.Prisma.OrdersScalarFieldEnum = {
  id: 'id',
  store_id: 'store_id',
  customer_id: 'customer_id',
  order_date: 'order_date',
  total_amount: 'total_amount',
  seller_id: 'seller_id',
  status: 'status'
};

exports.Prisma.PaymentMethodsScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.PaymentsScalarFieldEnum = {
  id: 'id',
  order_id: 'order_id',
  payment_method_id: 'payment_method_id',
  amount: 'amount',
  date: 'date',
  status: 'status'
};

exports.Prisma.ProductBrandsScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.ProductCategoriesScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.ProductCompatibilityScalarFieldEnum = {
  id: 'id',
  product_id: 'product_id',
  vehicle_model_id: 'vehicle_model_id'
};

exports.Prisma.ProductsScalarFieldEnum = {
  id: 'id',
  internal_code: 'internal_code',
  description: 'description',
  price: 'price',
  stock: 'stock',
  product_brand_id: 'product_brand_id',
  product_category_id: 'product_category_id',
  measurements: 'measurements',
  brand_id: 'brand_id',
  model_id: 'model_id',
  year: 'year',
  moneda: 'moneda',
  codigo_parte: 'codigo_parte',
  codigo_original: 'codigo_original'
};

exports.Prisma.ReturnsScalarFieldEnum = {
  id: 'id',
  order_id: 'order_id',
  product_id: 'product_id',
  quantity: 'quantity',
  reason: 'reason',
  return_date: 'return_date',
  type: 'type'
};

exports.Prisma.SuppliersScalarFieldEnum = {
  id: 'id',
  name: 'name',
  contact_info: 'contact_info'
};

exports.Prisma.StoreScalarFieldEnum = {
  id: 'id',
  name: 'name',
  address: 'address',
  phone: 'phone',
  email: 'email',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.UsersScalarFieldEnum = {
  id: 'id',
  username: 'username',
  password: 'password',
  email: 'email',
  role: 'role',
  status: 'status',
  store_id: 'store_id',
  created_at: 'created_at',
  updated_at: 'updated_at',
  last_login: 'last_login'
};

exports.Prisma.VehicleBrandsScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.VehicleModelsScalarFieldEnum = {
  id: 'id',
  name: 'name',
  vehicle_brand_id: 'vehicle_brand_id'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  CashBoxMovements: 'CashBoxMovements',
  CashBoxes: 'CashBoxes',
  Clients: 'Clients',
  GiftCards: 'GiftCards',
  LocalOrderItems: 'LocalOrderItems',
  LocalOrders: 'LocalOrders',
  OrderItems: 'OrderItems',
  Orders: 'Orders',
  PaymentMethods: 'PaymentMethods',
  Payments: 'Payments',
  ProductBrands: 'ProductBrands',
  ProductCategories: 'ProductCategories',
  ProductCompatibility: 'ProductCompatibility',
  Products: 'Products',
  Returns: 'Returns',
  Suppliers: 'Suppliers',
  Store: 'Store',
  Users: 'Users',
  VehicleBrands: 'VehicleBrands',
  VehicleModels: 'VehicleModels'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
