import scrapy
from leafly.items import DispItem


class MenuSpider(scrapy.Spider):
    name = "menu"
    allowed_domains = ["leafly.com"]
    start_urls = [
        'https://www.leafly.com/finder'
    ]

    def parse(self, response):
        for div in response.css('.landing-locations div').xpath(
                'descendant::div[1]/following-sibling::div[h4][1]/preceding-sibling::div[preceding-sibling::div[h4]]'):

            for links in div.css('a'):
                link = links.xpath('@href').extract()

                if not isinstance(link, (list, tuple)):
                    continue

                # item = DispItem()
                # item['state'] = link[0][-2:]
                # self.logger.info('got url: %s', str(link[0]))

                url = response.urljoin(link[0])
                self.logger.info('crawling link: %s', str(url))
                yield scrapy.Request(url, callback=self.parse_dir)

    def parse_dir(self, response):
        # item = response.meta['item']
        state = response.url[-2:]
        for links in response.css('finder-container ul')[0].xpath('li'):
            link = links.xpath('a/@href').extract()

            if not isinstance(link, (list, tuple)) and link == '/storefront':
                continue

            item = DispItem()
            item['state'] = state
            item['link'] = link[0]
            url = response.urljoin(item['link'])
            self.logger.info('crawling link: %s', str(url))
            yield scrapy.Request(url, callback=self.parse_dir_contents, meta={'item': item})

    def parse_dir_contents(self, response):
        item = response.meta['item']
        item['name'] = response.css('div.hero h1[itemprop="name"]::text').extract()
        item['logo'] = response.css('div.hero img[itemprop="image"]').xpath('@src').extract()
        item['address'] = '\n'.join(response.css('div[itemprop="address"] *::text').extract())
        item['phone'] = response.css('label[itemprop="telephone"]::text').extract()
        item['website'] = response.css('.storefront__info label a').xpath('@href').extract()

        if len(response.css('.storefront__info div')[0].css('div')) > 2:
            item['hours'] = response.css('.storefront__info div')[0].css('div')[2].css('label::text').extract()

        item['about'] = ' '.join(response.css('.storefront__info').xpath('following-sibling::section')[0]
                                 .css('div *::text').extract())

        for prop, val in item.items():
            if val and isinstance(val, (list, tuple)):
                item[prop] = val[0]

        url = response.urljoin(item['link'] + '/menu')

        yield scrapy.Request(url, callback=self.parse_menu, meta={'item': item})

    # @staticmethod
    def parse_menu(self, response):
        item = response.meta['item']
        item['menu'] = {}

        for section in response.css('.storefront__menu div'):
            section_name = section.css('.panel-heading span::text').extract()

            if len(section_name):
                section_name = str(section_name[0]).lower()
            else:
                continue

            if section_name not in item['menu']:
                item['menu'][section_name] = []

            for section_item in section.css('.colored--sativa div'):
                temp = dict()
                temp['name'] = section_item.xpath('@item-name').extract()

                if len(temp['name']):
                    temp['name'] = temp['name'][0]
                else:
                    continue

                temp['desc'] = section_item.xpath('@item-store-description').extract()

                if len(temp['desc']):
                    temp['desc'] = temp['desc'][0]

                temp['prices'] = []

                for price in section_item.css('.item-heading--price'):
                    num = price.css('.price::text').extract()
                    label = price.css('.hidden-sm::text').extract()

                    if len(num):
                        num = num[0]
                        if len(label):
                            label = label[0].lower()
                        else:
                            label = ''
                    else:
                        continue

                    temp['prices'].append([label, num])

                item['menu'][section_name].append(temp.copy())

        yield item
