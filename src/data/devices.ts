// 设备数据配置文件

export interface Device {
	name: string;
	image: string;
	specs: string;
	description: string;
	link: string;
}

// 设备类别类型，支持品牌和自定义类别
export type DeviceCategory = Record<string, Device[]> & {
	自定义?: Device[];
};

export const devicesData: DeviceCategory = {
	我的设备: [
		{
			name: "vivo X100 Pro",
			image: "/images/devices/vivo-x100-pro.jpg",
			specs: "智能手机",
			description: "我的手机，记录生活，也随时查看小屋的新内容。图片为官方产品展示图。",
			link: "https://www.vivo.com.cn/vivo/x100pro/",
		},
		{
			name: "戴尔 G15 5510",
			image: "/images/devices/dell-g15-5510.png",
			specs: "开发笔记本",
			description: "我的开发电脑，用来写代码、学习技术和调试项目。图片为官方产品展示图。",
			link: "https://www.dell.com/support/home/zh-cn/product-support/product/g-series-15-5510-laptop/overview",
		},
		{
			name: "阿里云服务器",
			image: "/images/devices/aliyun-server.svg",
			specs: "2 核 CPU / 2 GB 内存",
			description: "用于应用部署和服务器实践的云端设备。",
			link: "https://www.aliyun.com/",
		},
	],
};
