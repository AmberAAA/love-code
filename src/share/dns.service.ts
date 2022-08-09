import Alidns20150109, * as $Alidns20150109 from '@alicloud/alidns20150109';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';

@Injectable()
export default class DnsService {
  /**
   * 使用AK&SK初始化账号Client
   * @param accessKeyId
   * @param accessKeySecret
   * @return Client
   * @throws Exception
   */
  static createClient(): Alidns20150109 {
    const config = new $OpenApi.Config({
      // 您的 AccessKey ID
      accessKeyId: process.env.ALI_ACCESS_KEY_ID,
      // 您的 AccessKey Secret
      accessKeySecret: process.env.ALI_ACCESS_KEY_SECRET,
    });
    // 访问的域名
    config.endpoint = `alidns.cn-zhangjiakou.aliyuncs.com`;
    return new Alidns20150109(config);
  }

  async getDomainDetails() {
    const client = DnsService.createClient();
    const describeDomainRecordInfoRequest =
      new $Alidns20150109.DescribeDomainRecordInfoRequest({
        recordId: '699689872921549824',
      });
    const runtime = new $Util.RuntimeOptions({});
    return await client.describeDomainRecordInfoWithOptions(
      describeDomainRecordInfoRequest,
      runtime,
    );
  }

  async updateDomain(value: string) {
    const client = DnsService.createClient();
    const updateDomainRecordRequest =
      new $Alidns20150109.UpdateDomainRecordRequest({
        recordId: '699689872921549824',
        RR: 'srjc',
        type: 'A',
        value,
      });
    const runtime = new $Util.RuntimeOptions({});
    try {
      // 复制代码运行请自行打印 API 的返回值
      return await client.updateDomainRecordWithOptions(
        updateDomainRecordRequest,
        runtime,
      );
    } catch (error) {
      // 如有需要，请打印 error
      Util.assertAsString(error.message);
    }
  }

  async getMyIp() {
    const { data: ip } = await axios.get<string>('http://ip.sb', {
      headers: {
        'User-Agent': 'curl/7.81.0',
        Accept: '*/*',
      },
    });
    return ip.trim();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async task_ip() {
    const data = await this.getDomainDetails();
    const myIp = await this.getMyIp();
    Logger.log(`IP IS ${data.body.value}`);
    if (data.body.value !== myIp) {
      const { body } = await this.updateDomain(myIp);
      console.log(body);
      Logger.warn(`IP CHANGE TO ${myIp}`);
    }
  }
}