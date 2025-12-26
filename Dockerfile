FROM hub.smxzhcs.cn/xy_base/xy_nginx
WORKDIR /data/wwwroot
# 添加配置文件
ADD xy-cicada-web.conf /etc/nginx/conf.d/
# 添加打包好的dist文件到指定的文件目录
ADD dist /data/wwwroot/smxsc/xy-cicada-web/dist