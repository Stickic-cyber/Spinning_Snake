const levelConfigs = {
    level: {
        // 画布基础设置
        canvas: {
            bgColor: '#000'
        },
        
        // 中心点配置
        center: {
            radius: 50
        },
    
        // 圆形配置
        circles: {
            positions: [
                {x: -200, y: 0, radius: 40},
                {x: 100, y: 100, radius: 60},
                {x: 0, y: -100, radius: 40},
            ],
            baseRadius: 40, // 默认半径（当positions未指定时使用）
            connectionLine: 30
        },
    
        // 蓝色标记点配置
        blueDot: {
            radius: 10,
            orbitOffset: 10, // 轨道外延距离
            directionScale: 5 // 发射初速度
        },
    
        // 红色挡板配置
        barriers: [
            {x: 100, y: -50, width: 100, height: 20, collisionRadius: 1},
            {x: -70, y: -30, width: 115, height: 20, collisionRadius: 1},
            {x: -85, y: -150, width: 20, height: 140, collisionRadius: 1}

        ],
    
        // 星星配置
        star: {
            size: 40,
            spike: 5,
            safeDistance: 20, // 碰撞安全距离
            xOffset: 150, // 星星相对于中心点的 x 偏移量
            yOffset: -100  // 星星相对于中心点的 y 偏移量
        },
    
        // 游戏参数
        game: {
            rotationSpeed: 0.04, // 旋转速度
            collisionSafeDistance: 20, // 碰撞安全距离
            victoryTextSize: 60,
            gameOverTextSize: 60
        }
    }
};


window.levelConfigs = levelConfigs;
    