import {
  Injectable,
  InternalServerErrorException,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { Redis } from "ioredis";
import { InjectRedis } from "@nestjs-modules/ioredis";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

import { EXCHANGE_PUB_SUB_REDIS_CONNECTION } from "../../../constant/providers.js";
import { CustomConfigService } from "../../../modules/config/config.service.js";
import {
  ExchangeModel,
  ExchangeStatusEnum,
} from "../../../models/exchange/exchange.model.js";
import {
  OrderModel,
  OrderStatusEnum,
} from "../../../models/order/order.model.js";

// TODO: Abstract this logic for further use-case
// 1. Wriate a separate module (ex: @igap-nest/locksub)
// 2. Use an abstract class
// 3. Use an interface (+ namespace)
@Injectable()
export class ExchangePubsubService implements OnModuleInit, OnModuleDestroy {
  exchangeExpKeyPrefix = "EXCHANGE_EXP" as const;
  lockPrefix = "LOCK" as const;
  lockKeyPrefix = `${this.lockPrefix}_${this.exchangeExpKeyPrefix}` as const;

  lockExpirationTime = 60 as const; // in seconds

  constructor(
    @InjectModel(OrderModel.name)
    private readonly orderModel: Model<OrderModel>,
    @InjectModel(ExchangeModel.name)
    private readonly exchangeModel: Model<ExchangeModel>,
    @InjectRedis() private readonly redis: Redis,
    @InjectRedis(EXCHANGE_PUB_SUB_REDIS_CONNECTION)
    private readonly subRedis: Redis,
    private readonly configService: CustomConfigService,
  ) {}

  private getExchangeExpKeyOf(value: string) {
    return `${this.exchangeExpKeyPrefix}-${value}` as const;
  }

  private getExchangeLockKeyOf(id: string) {
    return `${this.lockKeyPrefix}-${id}` as const;
  }

  private getIdFromMessage(message: string) {
    const [_prefix, id] = message.split("-");

    if (!id || typeof id !== "string" || id.length === 0) {
      throw new InternalServerErrorException("COULD_NOT_EXPIRE_UNKOWN_KEY");
    }

    return id;
  }

  private async acquireLock(id: string) {
    const lockKey = this.getExchangeLockKeyOf(id);

    return new Promise<"OK" | null>((resolve) => {
      this.redis
        .set(lockKey, "locked", "EX", this.lockExpirationTime, "NX")
        .then((result) => {
          resolve(result);
        });
    });
  }

  private async releaseKey(id: string) {
    const key = this.getExchangeLockKeyOf(id);
    this.redis.del(key);
  }

  public async setExchangeExpirationKey(id: string) {
    return this.redis.setex(
      this.getExchangeExpKeyOf(id),
      this.configService.REDIS_EXPIRE_EXCHANGE,
      "",
    );
  }

  public async delExchangeExpirationKey(id: string) {
    return this.redis.del(this.getExchangeExpKeyOf(id));
  }

  async onModuleInit() {
    await this.subRedis.config("SET", "notify-keyspace-events", "Ex");

    const redisDB = this.configService.REDIS_DB;
    await this.subRedis.psubscribe(`__keyevent@${redisDB}__:expired`);

    this.subRedis.on("pmessage", async (_pattern, _channel, message) => {
      if (
        message.startsWith(this.exchangeExpKeyPrefix) ||
        message.startsWith(this.lockKeyPrefix)
      ) {
        const id = this.getIdFromMessage(message);

        const lock = await this.acquireLock(id);

        if (lock === "OK") {
          const exchange = await this.exchangeModel.findOneAndUpdate(
            {
              _id: new Types.ObjectId(id),
              status: {
                $in: [ExchangeStatusEnum.InProgress],
              },
            },
            {
              status: ExchangeStatusEnum.Expired,
            },
          );
          if (exchange) {
            await this.orderModel.findOneAndUpdate(
              {
                _id: exchange.orderRef,
                status: {
                  $in: [OrderStatusEnum.Created, OrderStatusEnum.InProgress],
                },
              },
              {
                status: OrderStatusEnum.Expired,
              },
            );
          }

          await this.releaseKey(id);
        }
      }
    });
  }

  async onModuleDestroy() {
    await this.subRedis.unsubscribe();
  }
}
