"""Arithmetic principle animations. Geometry is computed from counts, never from slides."""
import math

def render(im,d,t,sc,ctx,r):
    r.header(d,ctx)
    ink,blue,red,gold,paper=r.INK,r.TEAL,r.RED,r.GOLD,r.PAPER
    def txt(x,y,s,size=28,c=ink): d.text((x,y),str(s),font=r.F(size),fill=c)
    duration=max(.01,ctx.get('speech_duration',sc['duration']))
    q=r.clamp(t/duration/.88)
    p=sc.get('phase_start',0)+(sc.get('phase_end',1)-sc.get('phase_start',0))*q
    s=sc['stage']; m=sc['model']
    def box(x,y,w,h,c=paper,outline=ink): d.rectangle((x,y,x+w,y+h),fill=c,outline=outline,width=2)
    def dot(x,y,c=blue,rad=10): d.ellipse((x-rad,y-rad,x+rad,y+rad),fill=c)
    def bar(x,y,w,n,k,c=blue,h=58):
        box(x,y,w,h)
        for j in range(n):
            if j<k: box(x+w*j/n,y,w/n,h,c)
            if j: d.line((x+w*j/n,y,x+w*j/n,y+h),fill=ink,width=2)
    def formula(f): r.set_conclusion(ctx, f)
    def note(a,b=''): txt(750,280,a,27); txt(750,332,b,25)
    if m in ('decimal_product','fraction_product'):
        dec=m=='decimal_product'; cols=10 if dec else 3; rows=10 if dec else 4
        take=3 if dec else 2; rtake=4 if dec else 3
        if s>=4: cols=4 if dec else 5; take=1 if dec else 2
        x,y,w=260,213,320
        for row in range(rows):
            for col in range(cols):
                selected=col<take and (s>1 or (not dec and p>.45))
                deep=selected and row>=rows-rtake and (s in (2,3,5)) and (s==3 or p>.25+(.5*(rows-1-row)/rows))
                box(x+col*w/cols,y+row*w/rows,w/cols,w/rows,blue if deep else r.TEAL_BG if selected else paper, r.LINE)
        # Show grid lines progressively only during the first unit subdivision.
        if s==1 and p<.4:
            box(x,y,w,w)
            for i in range(1,cols):
                if p*cols*2.5>=i: d.line((x+i*w/cols,y,x+i*w/cols,y+w),fill=ink,width=2)
        d.rectangle((x,y,x+w,y+w),outline=ink,width=3)
        txt(x,y-35,'原来一整块 = 1',24)
        note(('每格 0.01' if s<4 else '换题：每格 1/40') if dec else f'全部：{cols} × {rows} 格', '原来的整体框一直保留')
        fs=(["10 × 10 = 100 格；每格 0.01","0.3 的 0.4：留下 3 列 × 4 行","12 × 0.01 = 0.12","0.25 × 0.4 = ?","4/40 = 1/10 = 0.1；0.100 = 0.1"] if dec else ["先取 2/3","再取这部分的 3/4","2/3 × 3/4 = 6/12 = 1/2","2/5 × 3/4：20 和 6 各数什么？","2/5 × 3/4 = 6/20 = 3/10"])
        formula(fs[s-1])
    elif m=='fraction_divide':
        n=8 if s==1 else 15; a=6 if s==1 else 10; b=3 if s==1 else 12
        txt(180,211,'同一个长度单位：1 米',25)
        bar(180,265,720,n,a); bar(180,390,720,n,b,gold)
        txt(930,275,'3/4 米' if s==1 else '2/3 米');txt(930,400,'3/8 米' if s==1 else '4/5 米')
        if s==1:
            for i in range(2): d.rectangle((180+i*270,258,180+(i+1)*270,330),outline=red,width=4)
        if s==3:
            for i in range(int(6*p)+1):
                if i<6: d.rectangle((180+i*96,258,180+(i+1)*96,456),outline=red,width=3)
            txt(180,485,'12 小段为 1 份；每 2 小段是这份的 1/6',25)
        if s==5:
            # Abstract quantities change together; original metre bars remain above.
            factor=(1-.75*min(1,p*2)) if p<.5 else (.25+min(1,(p-.5)*2))
            box(180,500,480*(2/3)*factor,20,blue); box(180,530,480*(4/5)*factor,20,gold)
            txt(750,489,'两量同步 ÷4，再 ×5',25)
        formula(['6 小段 ÷ 每份 3 小段 = 2 份','2/3 ÷ 4/5 = 10 ÷ 12','10/12 = 5/6 份','怎样把每份 4/5 变成 1？','(2/3 × 5/4) ÷ (4/5 × 5/4) = 5/6'][s-1])
    else:
        _other(d,sc,r,p,txt,box,dot,bar,formula,note)

def _other(d,sc,r,p,txt,box,dot,bar,formula,note):
    s=sc['stage'];m=sc['model']; blue,red,gold,ink=r.TEAL,r.RED,r.GOLD,r.INK
    if m=='multiple':
        u=180;x=220
        bx=x;by=260
        rx=x;ry=390
        if s==3:
            f=math.sin(math.pi*p); rx+=u*f;ry-=130*f
        bar(bx,by,u,1,1)
        for j in range(3):
            a=1 if s>1 else r.clamp(p*3-j)
            if a: box(rx+j*u,ry-90*(1-a),u,58,gold if s==2 and j>0 else red)
        txt(90,270,'蓝绳',26);txt(90,400,'红绳',26)
        if s>=4:
            txt(850,290,'合长 24 厘米',28)
            if s==5:
                for j in range(3):txt(x+j*u+35,403,'6 厘米',24,r.PAPER)
                txt(x+35,273,'6 厘米',24,r.PAPER)
        if s>=3:
            d.line([(220,468),(220,478),(760,478),(760,468)],fill=gold,width=3)
            txt(365,486,'4 份合起来：24 厘米',24,gold)
        formula(['1 份 → 同样长的 3 份','3 倍是整条；多出的是 2 份','和：1 + 3 = 4 份；差：3 - 1 = 2 份','24 厘米对应几份？一份多长？','24 ÷ 4 = 6；蓝 6 厘米，红 18 厘米'][s-1])
    elif m=='fraction_birth':
        x,y,w=240,215,300
        unequal=s>=4
        heights=[.1,.2,.3,.4] if unequal else [.25]*4
        yy=y
        for i,h in enumerate(heights):
            fill=blue if (i==0 or s==2 and i<1+int(p*2.999)) else r.PAPER
            box(x,yy,w,w*h,fill);yy+=w*h
        if s==3:
            for row in range(2):
                for col in range(2):box(750+col*150,215+row*150,150,150,blue if row==col==0 else r.PAPER)
            txt(730,525,'同大纸，每份面积相同',24)
        if s==5:
            for i in range(1,4): d.line((x,y+i*75,x+w,y+i*75),fill=red,width=3)
            note('红线：真正的四等份','原来的四块有大有小')
        formula(['平均分成 4 份，取 1 份：1/4','每份大小没变：1/4 + 2/4 = 3/4','形状可以不同；都占原纸的 1/4','四块大小不同，每块都能叫 1/4 吗？','不能：分成四块，还必须平均分'][s-1])
    elif m=='sets':
        d.ellipse((130,225,680,530),outline=blue,width=3);d.ellipse((490,225,1040,530),outline=gold,width=3)
        txt(170,190,'苹果 18 人',25);txt(820,190,'香蕉 15 人',25)
        pts=[]
        for count,x,cols in [(11,220,3),(7,555,2),(8,800,3),(4,1100,1)]:
            for j in range(count):pts.append((x+(j%cols)*62,280+(j//cols)*54))
        for i,(x,y) in enumerate(pts):
            if s==4 and i>=26: continue
            dot(x,y,blue if i<26 else gold,16);txt(x-12,y-12,str(i+1),19,r.PAPER)
            if s>=2 and i<26 and (s!=2 or p>=i/33):
                box(x-17,y+18,15,10,blue)
                if 11<=i<18 and (s==2 or s==3 and p<.9):box(x+3+(180*p if s==3 else 0),y+18-(140*p if s==3 else 0),15,10,gold)
        formula(['全班 30 人；两种都喜欢的 7 人','中间 7 人各有两张票：被算了两次','18 + 15 - 7 = 26 人；人没有被拿走','全班 30 人，圈内 26 人，圈外呢？','30 - 26 = 4 人；交集 7 人仍在圈内'][s-1])
    elif m in ('decimal_birth','equivalent','fraction_add'):
        x,w=180,720
        if m=='decimal_birth':
            groups=1 if s==1 else 3
            bar(x,330,w,10,groups,blue,h=76)
            txt(x,262,'0',25);txt(x+w-48,262,'1 米',25)
            txt(x,302,'每大格 0.1 米' + ('；每小格 0.01 米' if s>=3 else ''),23,r.MUTED)
            for i in range(1,10):
                txt(x+w*i/10-15,415,f'{i/10:.1f}',19,r.MUTED)
            if s>=3:
                # Fine ticks grow inside each 0.1 m major cell.
                for i in range(1,100):
                    if i%10:d.line([(x+w*i/100,330),(x+w*i/100,330+76*min(1,p*2))],fill=ink,width=1)
            # 括号：把“几大格 / 几小格”落到同一条尺上。
            bx2=x+w*groups/10
            d.line([(x,452),(x,462),(bx2,462),(bx2,452)],fill=red,width=3)
            label=(f'{groups} 个 0.1 米 = {groups/10:.1f} 米' if s<=2
                   else '3 大格 × 10 小格 = 30 小格')
            txt((x+bx2)/2-len(label)*9,472,label,23,red)
            formula(['1 米 ÷ 10 = 0.1 米 = 1 分米','3 个 0.1 米 = 0.3 米','1 米 ÷ 100 = 0.01 米','3 大格现在有多少小格？长度变了吗？','0.3 米 = 0.30 米；30 个百分之一米'][s-1])
        elif m=='equivalent':
            w=600;n=[2,4,8,2,3][s-1]
            if s<4:
                old=2 if s<=2 else 4
                bar(x,320,w,old,old//2)
                if s>1:
                    for i in range(1,n,2):d.line((x+w*i/n,320,x+w*i/n,320+58*p),fill=ink,width=2)
            else:
                bar(x,320,w,2,1)
                box(x+w+((1-p)*130 if s==4 else 0),320,w/2,58,r.PAPER)
                if s==5: d.rectangle((x,314,x+w*1.5,384),outline=red,width=3)
            txt(x,260,'原来的整体',26)
            formula(['涂色 1/2；只改变分法','1/2 = 2/4','1/2 = 2/4 = 4/8','另接半条白纸：涂色还是新整体的 1/2 吗？','新整体有 3 个同长部分，涂色占 1/3'][s-1])
        else:
            n=6 if s<4 else 12
            bar(x,260,w,n,0);txt(940,270,'1 米',25)
            box(x,335,w/2,50,blue)
            f=p if s==3 else 1 if s>=4 else 0
            box(x+w/2*f,435-100*f,w/3,50,gold)
            if s>=2:
                for i in range(1,n):d.line((x+w*i/n,260,x+w*i/n,485),fill=r.LINE,width=1)
            formula(['1/2 米和 1/3 米，每份并不一样长','1/2 = 3/6；1/3 = 2/6','1/2 + 1/3 = 5/6 米','改用 1/12 米量，绳子会变长吗？','6/12 + 4/12 = 10/12 = 5/6 米'][s-1])
    elif m in ('multiply','distributive','product_change','odd_layers'):
        if m=='multiply':
            cols,rows=23,14;gx,gy,dx,dy=104,256,19,18
            lift=10*math.sin(math.pi*p) if s==1 else 0
            for j in range(rows):
                for i in range(cols):
                    yy=gy+j*dy+(lift if j>=10 else 0)
                    box(gx+i*dx,yy,dx,dy,blue if j<10 else gold,r.LINE)
            txt(gx,210,'每行 23 个，共 14 行',25)
            # 左侧说明：10 行 + 4 行，与竖式的两层一一对应。
            d.line([(gx,gy+10*dy),(gx+cols*dx,gy+10*dy)],fill=red,width=2)
            txt(gx+cols*dx+8,gy+6*dy,'10 行',23,blue)
            txt(gx+cols*dx+8,gy+11.4*dy,'4 行',23,gold)
            if s in (2,3):
                y1,y2=(gy,gy+10*dy) if s==2 else (gy+10*dy,gy+14*dy)
                d.rectangle((gx,y1,gx+cols*dx,y2),outline=red,width=4)
            # 竖式卡片：四列对齐，部分积和最终结果各有自己的基线。
            d.rounded_rectangle((650,180,1200,570),16,fill=(252,248,239),outline=r.LINE,width=2)
            txt(682,196,'竖式',20,r.MUTED)
            columns=(900,970,1040,1110)
            for x,name in zip(columns,('千','百','十','个')):txt(x,220,name,20,r.MUTED)
            for row,value in ((254,'23'),(322,'14')):
                for x,ch in zip(columns[-len(value):],value):txt(x,row,ch,47)
            txt(846,286,'×',40,r.MUTED)
            d.line((872,382,1162,382),fill=ink,width=3)
            if s==2:
                d.rounded_rectangle((880,388,1162,448),12,fill=r.GOLD_BG)
            if s==3:
                d.rounded_rectangle((880,455,1162,515),12,fill=r.TEAL_BG)
            if s==5:
                d.rounded_rectangle((880,522,1162,568),12,fill=r.RED_BG)
            if s>=2:
                for x,ch in zip(columns[2:],'92'):txt(x,396,ch,46,gold)
                txt(690,410,'第一层：23 × 4',21,gold)
            if s>=3:
                for x,ch in zip(columns[1:],'230'):txt(x,462,ch,46,blue)
                txt(690,476,'第二层：23 × 10',21,blue)
                d.line((872,516,1162,516),fill=ink,width=3)
            if s==4:txt(1090,524,'?',44,red)
            if s==5:
                for x,ch in zip(columns[1:],'322'):txt(x,523,ch,46,red)
            formula(['23 × 14 = 23 × (10 + 4)','23 × 4 = 92','23 × 10 = 230；第二层表示 23 个十','92 + 230 = ?','92 + 230 = 322；不能把 230 写成 23'][s-1])
        elif m=='distributive':
            for row in range(7):
                for col in range(5):
                    yy=245+row*40+(30*math.sin(math.pi*p) if s==3 and row>=3 else 0)
                    color=blue if row<3 else gold
                    if s>=4 and row>=3 and col>0:color=r.LINE if s==4 else red
                    dot(270+col*65,yy,color,13)
            note('上：3 行，每行 5 个','下：4 行，每行 5 个')
            formula(['7 行，每行 5 个','(3 + 4) × 5','3 × 5 + 4 × 5 = 35','如果写成 3 × 5 + 4，漏了哪里？','下面每行漏 4 个：共漏 4 × 4 = 16'][s-1])
        elif m=='product_change':
            # 固定 2 列 × 3 行的“积木盘”：每次复制一块，盘面直接变大。
            nr=1 if s<3 else 2 if s<5 else 3;nc=1 if s==1 else 2
            card_w,card_h=470,112
            for br in range(3):
                for bc in range(2):
                    xx=140+bc*560;yy=186+br*128
                    active=br<nr and bc<nc
                    d.rounded_rectangle((xx,yy,xx+card_w,yy+card_h),14,
                                        fill=(252,248,239) if active else (247,242,231),
                                        outline=r.GOLD if active else r.LINE,width=2)
                    if not active:continue
                    a=1
                    if s==2 and bc==1:a=p
                    if s==3 and br==1:a=p
                    if s==5 and br==2:a=p
                    for row in range(2):
                        for col in range(3):
                            dot(xx+100+col*105,yy+34+row*48,r.blend(blue,r.BG,a),15)
                    txt(xx+360,yy+38,'6 点',24,r.MUTED)
            txt(140,150,'每块：3 列 × 2 行 = 6 点',25,r.MUTED)
            formula(['3 × 2 = 6 个点','横向两块：6 × 2 = 12','两排，每排两块：6 × 4 = 24','长 ×2，宽 ×3，能摆几块？','3 排 × 每排 2 块 = 6 块；共 36 点'][s-1])
        else:
            start,end={1:(1,2),2:(2,4),3:(4,5),4:(3,3),5:(3,5)}[s]
            count=start*start+int((end*end-start*start)*p+.001)
            ordered=[point for k in range(end) for point in ([(k,j) for j in range(k+1)]+[(i,k) for i in range(k)])]
            colors=[blue,gold,red,(92,119,168),(120,150,70)]
            for i,j in ordered[:count]:dot(260+i*60,235+j*60,colors[max(i,j)],16)
            note('每次补右边一列','再补下边一行，角点只算一次')
            formula(['1 + 3 = 2 × 2','1 + 3 + 5 + 7 = 4 × 4','新一列 n 个 + 新一行 (n-1) 个 = 2n-1','从 3×3 到 5×5，要添哪两个奇数？','7 + 9 = 16；25 - 9 = 16'][s-1])
    elif m=='place_shift':
        if s<=3:
            names=['十','个','十分','百分'];x=230;w=195
            for i,name in enumerate(names):box(x+i*w,250,w,190);txt(x+i*w+55,270,name,28)
            f=p if s==2 else 1 if s==3 else 0
            for i,ch in enumerate('325'):txt(x+(i+1-f)*w+75,350,ch,50,blue)
            if s==3:txt(400,475,'3.250 = 3.25，数值没有变',28,red)
        else:
            bar(180,350,780,12,12);txt(180,285,'同一把尺：1.2 米',30)
            if s==5:txt(180,445,'12 个分米；实际长度不变',30)
        formula(['3 个一、2 个十分之一、5 个百分之一','每张数字卡同时移向十倍大的数位','3.25 × 10 = 32.5','1.2 米 = 12 分米：尺子变长十倍了吗？','换单位：长度没变，单位变小，个数变多'][s-1])
    elif m=='successive':
        if s==1:v=100+20*p
        elif s==2:v=120
        elif s==3:v=120-24*p
        elif s==4:v=96
        else:v=96+24*min(p*2,1) if p<.5 else 120-20*(p-.5)*2
        x,y,w,scale=230,530,260,2.2
        box(x,220,w,310,r.PAPER);box(x+3,y-v*scale,w-6,v*scale,blue)
        for value in ([96] if s==4 else [96,100,120]):
            yy=y-value*scale;d.line((x-15,yy,x+w+15,yy),fill=red if value==100 else r.LINE,width=2);txt(x+w+30+(105 if value==96 else 0),yy-15,f'{value} 升',25)
        base=100 if s==1 or (s==5 and p>=.5) else 120
        bar(830,260,240,5,4 if s==4 else 5,gold)
        if s==4:
            txt(790,345,'倒出前的整体：? 升',27)
            txt(790,395,'留下 4/5，是 96 升',27)
        else:
            txt(790,345,f'本次整体：{base} 升',27);txt(790,395,f'每份：{base//5} 升',27)
        formula(['100 + 100 × 20% = 120 升','120 的 20% = 24 升','100 × 1.2 × 0.8 = 96 升','96 是倒出前的 80%，怎样还原？','96 ÷ 0.8 = 120；120 ÷ 1.2 = 100'][s-1])
    elif m=='quotient_scale':
        if s<3:
            bar(180,330,840,3,3)
            for i in range(3):txt(230+i*280,345,'200' if s==1 or p<.5 else '2',30,r.PAPER)
            txt(450,240,'总量 600' if s==1 or p<.5 else '总量 6',35)
        else:
            # 85 cards, each always represents ten original units.
            for i in range(85):
                row,col=divmod(i,15);x=170+col*48;y=235+row*45
                if not (s==5 and i==84):
                    box(x,y,36,30,gold if i==84 else blue)
                    txt(x+4,y+3,'十',20,r.PAPER)
            for k in range(int(28*p) if s==3 else 28):
                i=k*3;row,col=divmod(i,15)
                d.rectangle((166+col*48,231+row*45,166+col*48+141,231+row*45+38),outline=red,width=2)
            txt(930,270,'每 3 个十一组',26)
            txt(930,330,'余下的 1 是什么？' if s==4 else '28 组 + 1 个十',26)
            if s==5:
                for i in range(10):
                    ox,oy=170+9*48+18,235+5*45+15
                    tx,ty=960+(i%5)*38,430+(i//5)*45
                    dot(ox+(tx-ox)*p,oy+(ty-oy)*p,gold,3+7*p)
        formula(['600 ÷ 200 = 3','总量与每份同除以 100：6 ÷ 2 = 3','850 个一 = 85 个十；30 个一 = 3 个十','85 ÷ 3 = 28 余 1；这一个是什么单位？','1 个十 = 10 个一；850 = 30 × 28 + 10'][s-1])
    elif m in ('grouping','long_divide'):
        _groups(d,sc,p,r,txt,box,dot,formula)
    else: raise ValueError('Unknown arithmetic model: '+m)

def _groups(d,sc,p,r,txt,box,dot,formula):
    s=sc['stage'];m=sc['model'];blue,gold,ink,red=r.TEAL,r.GOLD,r.INK,r.RED
    if m=='grouping':
        n=12 if s<=4 else 13 if s<=6 else 17
        size=3 if s<=6 else 5
        equal=s==2 or s==8
        groups=size if equal else n//size
        each=n//size if equal else size
        if s in (4,8):
            arrangements=[(3,4,'分给 3 人：每人 4 颗'),(4,3,'每袋 3 颗：装满 4 袋')] if s==4 else [(5,3,'分给 5 人：每人 3 颗'),(3,5,'每袋 5 颗：装满 3 袋')]
            for row,(ng,each,label) in enumerate(arrangements):
                yy=265+row*145
                txt(140,yy-38,label,25)
                for g in range(ng):
                    xx=140+g*170;box(xx,yy,145,80,r.PAPER)
                    for j in range(each):dot(xx+28+(j%3)*40,yy+24+(j//3)*34,blue,10)
                if s==8:
                    for j in range(2):dot(1100+j*40,yy+40,gold,10)
            formula('12 ÷ 3 = 4；上图求每人几颗，下图求装几袋' if s==4 else '17 ÷ 5 = 3 余 2；上图的 3 是颗数，下图的 3 是袋数')
            return
        if s==6:
            # 前半仍是13颗；后半明确另起15颗，保留4袋和外面的3颗。
            changed=p>.5
            spacing=170 if changed else 190
            for g in range(4):
                xx=140+g*spacing;box(xx,350,150,155,r.PAPER)
                txt(xx+15,510,f'{g+1}袋',23)
                for j in range(3):dot(xx+30+j*40,385,blue,12)
            if changed:
                txt(140,205,'另起一题：15 颗糖',27)
                box(820,350,150,155,r.PAPER);txt(835,510,'第 5 袋',23)
                a=r.clamp((p-.5)*2)
                for j in range(3):
                    sx,sy=1100,350+j*45;tx,ty=850+j*40,385
                    dot(sx+(tx-sx)*a,sy+(ty-sy)*a,gold,12)
                formula('15 颗：外面剩的 3 颗，还能再装满一袋')
            else:
                dot(1100,380,gold,12)
                formula('13 颗：装满 4 袋，余 1；1 < 3')
            return
        if s in (1,7):
            if n==12:
                for i in range(n):dot(150+i*82,330,blue,15)
            else:
                for i in range(n):dot(210+(i%9)*90,290+(i//9)*90,blue,15)
        else:
            spacing=190 if groups<=4 else 170
            for g in range(groups):
                box(140+g*spacing,350,150,155,r.PAPER)
                txt(155+g*spacing,510,f'{g+1}'+('号碗' if equal else '袋'),23)
            for i in range(n):
                sx,sy=180+(i%9)*95,245+(i//9)*45
                if i<groups*each:
                    g=i%groups if equal else i//each;j=i//groups if equal else i%each
                    tx,ty=170+g*spacing+(j%3)*40,385+(j//3)*55
                    motion=r.clamp(p*2) if s==5 else p
                    a=1 if s==9 else r.clamp(motion*1.5-i/n*.5)
                    dot(sx+(tx-sx)*a,sy+(ty-sy)*a,blue,12)
                else:dot(1100,380+(i-groups*each)*45,gold,12)
        fs=['12 颗糖 ÷ 3 = 4：这个 3 表示什么？','12 颗 ÷ 3 人 = 每人 4 颗','12 颗 ÷ 每袋 3 颗 = 4 袋','3 × 4 = 12：每份几个，还是有几份？','13 颗：4 袋，每袋 3 颗，剩 1 颗','1 < 3；再添 2 颗，就能装满一袋','17 ÷ 5：请讲两个故事','17 颗 ÷ 5 人：每人 3 颗，剩 2 颗','17 = 5 × 3 + 2；每袋 5 颗，共 3 袋']
        formula(fs[s-1])
    else:
        for g in range(3):box(120+g*270,365,220,175,r.PAPER)
        if s<3:
            for b in range(5):
                sx,sy=120+b*140,245
                a=p if s==2 and b<3 else 0
                tx,ty=150+b*270,390
                xx=sx+(tx-sx)*a;yy=sy+(ty-sy)*a
                for j in range(10):d.line((xx+j*6,yy,xx+j*6,yy+55),fill=blue,width=4)
                d.line((xx-4,yy+27,xx+58,yy+27),fill=gold,width=5)
            for j in range(6):dot(835+(j%2)*24,260+(j//2)*35,gold,9)
        else:
            # Every ten remains ten strokes, including while the last two bundles open.
            for g in range(3):
                for j in range(10):d.line((150+g*270+j*6,390,150+g*270+j*6,445),fill=blue,width=4)
            total=27 if s==5 else 26
            for i in range(total):
                g=i%3;j=i//3
                sx=120+(i%13)*56;sy=240+(i//13)*55
                tx=150+g*270+(j%4)*40;ty=465+(j//4)*28
                if i>=24 and s!=5:tx,ty=925,380+(i-24)*45
                a=r.clamp((p-.3)/.7) if s==3 else 1
                if s==3 and i<20:
                    b,jj=divmod(i,10)
                    ox,oy=540+b*140+jj*6,272
                    unfold=r.clamp(p/.3)
                    sx=ox+(sx-ox)*unfold;sy=oy+(sy-oy)*unfold
                if s==3 and i>=20:
                    j=i-20;ox,oy=835+(j%2)*24,260+(j//2)*35
                    unfold=r.clamp(p/.3)
                    sx=ox+(sx-ox)*unfold;sy=oy+(sy-oy)*unfold
                if s==5 and i>=24:
                    sx,sy=925,330+(i-24)*35;a=p
                xx=sx+(tx-sx)*a;yy=sy+(ty-sy)*a
                if s==3 and i<20:
                    half=27*(1-r.clamp(p/.3))+9*r.clamp(p/.3)
                    d.line((xx,yy-half,xx,yy+half),fill=gold,width=4)
                else:dot(xx,yy,gold,9)
            txt(120,205,'另起一题：57 ÷ 3' if s==5 else '回到原题：56 ÷ 3' if s==6 else '20 个一 + 6 个一',24)
        # 商的数字始终与被除数的十位、个位对齐。
        tens,ones=1090,1140
        txt(tens,205,'十',22,r.MUTED);txt(ones,205,'个',22,r.MUTED)
        txt(995,300,'3',32)
        d.line(((1040,342),(1050,285),(1190,285)),fill=ink,width=2)
        txt(tens,300,'5',32);txt(ones,300,'7' if s==5 else '6',32)
        if s>=2:
            txt(tens,245,'1',32,blue)
            txt(tens,345,'3',32)
            d.line((1075,385,1185,385),fill=ink,width=2)
            txt(tens,390,'2',32,gold)
        if s>=3:
            ready=s!=3 or p>.7
            txt(ones,390,'7' if s==5 else '6',32,gold)
            if ready:
                extra=s==5 and p>.95
                txt(ones,245,'9' if extra else '8',32,blue)
                txt(tens,435,'2',32);txt(ones,435,'7' if extra else '4',32)
                d.line((1075,475,1185,475),fill=ink,width=2)
                txt(ones,482,('0' if extra else '3') if s==5 else '2',32,red)
        formula(['56：5 个十、6 个一，平均分 3 份','每份先拿 1 个十，剩 2 个十','2 个十拆成 20 个一；26 ÷ 3 = 8 余 2','18 × 3 + 2 = 56；余数能是 3 吗？','57 ÷ 3：每份 18 再拿 1，得到 19','56 ÷ 3 = 18 余 2；18 × 3 + 2 = 56'][s-1])
