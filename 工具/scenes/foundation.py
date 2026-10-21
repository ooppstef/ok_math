"""Conserved base-ten counters and rigid rectangular-array rotations."""
import math


def array_points(rows,cols,cx,cy,gap,angle=0):
    """A rigid rotation: each of rows*cols identities keeps its pairwise distances."""
    c,s=math.cos(angle),math.sin(angle)
    return [(cx+((j-(cols-1)/2)*c-(i-(rows-1)/2)*s)*gap,
             cy+((j-(cols-1)/2)*s+(i-(rows-1)/2)*c)*gap)
            for i in range(rows) for j in range(cols)]


def render(im,d,t,sc,ctx,r):
    r.header(d,ctx)
    blue,gold,red,ink=r.TEAL,r.GOLD,r.RED,r.INK
    def txt(x,y,text,size=28,color=ink):d.text((x,y),str(text),font=r.F(size),fill=color)
    def formula(text):txt(84,565,text,28,blue)
    def dot(x,y,color=blue,rad=6):
        if sc['model']=='place_value':d.line((x,y-rad,x,y+rad),fill=color,width=4)
        else:d.ellipse((x-rad,y-rad,x+rad,y+rad),fill=color)
    def box(x,y,w,h,color=r.PAPER):d.rectangle((x,y,x+w,y+h),fill=color,outline=ink,width=2)
    txt(84,122,sc['title'],36)
    q=r.clamp(t/max(.01,ctx.get('speech_duration',sc['duration']))/.88)
    p=sc.get('phase_start',0)+(sc.get('phase_end',1)-sc.get('phase_start',0))*q
    s=sc['stage'];model=sc['model']
    def lerp(a,b,f):return [(x+(u-x)*f,y+(v-y)*f) for (x,y),(u,v) in zip(a,b)]
    def bundle(i,x=160,y=285):
        # Ten visible unit dots per bundle; five columns of bundles per row.
        bx=x+(i%5)*112;by=y+(i//5)*90
        return [(bx+(j%5)*15,by+(j//5)*21) for j in range(10)]
    def singles(n,x=820,y=285):return [(x+(j%5)*48,y+(j//5)*45) for j in range(n)]
    def base10(n):
        tens,ones=divmod(n,10)
        return [pt for i in range(tens) for pt in bundle(i)]+singles(ones)
    def draw_points(points,removed=(),radius=6):
        rem=set(removed)
        for i,(x,y) in enumerate(points):dot(x,y,red if i in rem else blue,radius)
    def labels(left='十位：每框 10 个一',right='个位：每点 1 个一'):
        if model=='place_value':left,right='十位：每捆 10 根','个位：每根 1 个一'
        txt(140,210,left,25);txt(790,210,right,25)
    def outlines(n):
        for i in range(n):
            bx,by=bundle(i)[0];d.rectangle((bx-12,by-13,bx+73,by+34),outline=gold,width=2)
    if model=='place_value':
        if s==1:
            pts=singles(10,240,350)
            for i,(x,y) in enumerate(pts):
                if i<9 or p>.35:dot(x,y,red if i==9 else blue,11)
            txt(800,320,'9 个一 + 1 个一',30);formula('9 + 1 = 10；十根小棒怎样记？')
        elif s==2:
            old=singles(10,240,350);new=bundle(0,390,350)
            draw_points(lerp(old,new,p),radius=8)
            if p>.85:d.rectangle((370,330,475,395),outline=gold,width=4)
            txt(750,320,'总数始终是 10',30)
            formula('10 个一 = 1 个十；打包只改变数法')
        elif s in (3,4):
            n=23 if s==3 else 22;labels();draw_points(base10(n));outlines(2)
            txt(200,450,'2 个十 = 20',32);txt(820,450,f'{n%10} 个一 = {n%10}',32)
            formula('23 = 20 + 3' if s==3 else '22：左边的 2 是 20，右边的 2 是 2')
        elif s==5:
            for i,(name,v) in enumerate([('百位',3),('十位',0),('个位',5)]):
                box(210+i*300,240,240,210);txt(270+i*300,260,name,30);txt(300+i*300,335,v,55,red if i==1 else blue)
            formula('305 = 3 个百 + 0 个十 + 5 个一；0 要占位')
        elif s==10:
            for i,name in enumerate(('百位','十位','个位')):
                box(210+i*300,240,240,210);txt(270+i*300,260,name,30)
            if p<.3:txt(600,335,0,55,r.blend(red,r.PAPER,1-p/.3))
            txt(300+300*r.clamp((p-.3)/.7),335,3,55,blue)
            txt(900,335,5,55,blue)
            formula('305 → 35：去掉占位的 0，数值改变了')
        elif s==6:
            left=base10(23);right=[(x,y+90) for x,y in base10(45)]
            points=left+right;target=[pt for i in range(2) for pt in bundle(i)]+singles(8)[:3]+[pt for i in range(2,6) for pt in bundle(i)]+singles(8)[3:]
            draw_points(lerp(points,target,p));
            if p>.95:outlines(6)
            labels();formula('23 + 45：同单位相加，6 个十、8 个一 = 68')
        elif s==7:
            old=base10(99)+[(1060,375)]
            mid=[pt for i in range(10) for pt in bundle(i)]
            final=[(330+(i%10)*19,275+(i//10)*19) for i in range(100)]
            points=lerp(old,mid,min(p*2,1)) if p<.5 else lerp(mid,final,(p-.5)*2)
            draw_points(points, radius=5)
            if p>.95:d.rectangle((315,260,516,461),outline=gold,width=4)
            txt(780,420,'100 个一一直都在',28)
            txt(780,465,'10 个一 → 1 个十',26)
            txt(780,510,'10 个十 → 1 个百',26)
            formula('99 + 1 = 100：1 个百、0 个十、0 个一')
        elif s in (8,9):
            for i,ch in enumerate('037'):box(290+i*250,270,160,130);txt(345+i*250,295,ch,64,blue)
            formula('每个数字用一次：最大和最小的三位数？' if s==8 else '最大 730；最小 307。三位数的百位不能是 0')
            if s==9:txt(300,460,'百位先放 3，再把 0 放十位',32)
    elif model=='column_exchange':
        labels()
        if s in (4,7,11):
            top,bottom,result={4:('38','+47','85'),7:('52','-27','25'),11:('100','-28','72')}[s]
            for yy,text in [(425,top),(465,bottom),(515,result)]:
                width=d.textlength(text,font=r.F(30));txt(1170-width,yy,text,30,blue if yy==515 else ink)
            d.line((1050,508,1180,508),fill=ink,width=2)
            if s==4:txt(1110,400,'1',20,red)
        if s==1:
            txt(220,300,'38 + 47',55);txt(790,300,'715  × 错',48,red)
            txt(230,435,'15 个一还没有换成十和一',32)
            formula('8 + 7 = 15；15 不能直接挤在个位')
        elif s in (2,3,4):
            old=[pt for i in range(7) for pt in bundle(i)]+singles(15)
            target=[pt for i in range(8) for pt in bundle(i)]+singles(5)
            pts=old if s==2 else lerp(old,target,p) if s==3 else target
            draw_points(pts);outlines(7 if s==2 else 8 if s==4 else 0)
            if s==2:
                txt(140,460,'3 个十 + 4 个十 = 7 个十',28)
                txt(780,460,'8 个一 + 7 个一',28)
            if s==4:txt(150,460,'十位：3 + 4 + 1 = 8',30);txt(780,460,'个位写 5',24)
            formula(['38 + 47：7 个十和 15 个一','15 个一 → 1 个十和 5 个一；总量仍是 85','38 + 47 = 85；进位的 1 表示 1 个十'][s-2])
        elif s in (5,6,7):
            old=base10(52)
            # First forty identities stay bundled; the fifth ten joins the two ones.
            opened=[pt for i in range(4) for pt in bundle(i)]+singles(12)
            if s==5:pts=old
            elif s==6:pts=lerp(old,opened,p)
            else:
                pts=opened[:];remove=list(range(20))+list(range(40,47))
                targets=[(170+(j%15)*36,475+(j//15)*32) for j in range(27)]
                for idx,xy in zip(remove,targets):pts[idx]=lerp([pts[idx]],[xy],p)[0]
            draw_points(pts,remove if s==7 else ());outlines(5 if s==5 else 4 if s==6 and p>.95 else 0)
            if s==7:txt(760,465,'红色：拿走 27 元',24,red)
            formula(['52 - 27：个位的 2 不够减 7','1 个十拆成 10 个一：4 个十、12 个一','拿走 2 个十和 7 个一：剩 2 个十、5 个一 = 25'][s-5])
        elif s==8:
            txt(310,300,'100 - 28 = ?',60,blue)
            txt(270,435,'十位和个位都是 0，怎样拆？',32)
            formula('先暂停，画一画，再看答案')
        elif s in (9,10,11):
            hundred=[(260+(i%10)*20,265+(i//10)*20) for i in range(100)]
            tens=[pt for i in range(10) for pt in bundle(i)]
            opened=[pt for i in range(9) for pt in bundle(i)]+singles(10)
            pts=lerp(hundred,tens,p) if s==9 else lerp(tens,opened,p) if s==10 else opened[:]
            remove=list(range(20))+list(range(90,98))
            if s==11:
                for j,idx in enumerate(remove):pts[idx]=lerp([pts[idx]],[(170+(j%15)*36,475+(j//15)*32)],p)[0]
            draw_points(pts,remove if s==11 else ())
            if s==9 and p>.95:outlines(10)
            if s==10 and p>.95:outlines(9)
            if s==11:txt(760,465,'红色：拿走 28 元',24,red)
            formula(['1 个百 = 10 个十；总量还是 100','再拆 1 个十：9 个十和 10 个一，仍是 100','10 - 8 = 2；9 - 2 = 7；100 - 28 = 72'][s-9])
    elif model=='rigid_array':
        if s in (1,2,3):
            rows,cols=(3,4) if s<3 else (6,7)
            angle=(math.pi/2*p) if s>=2 else 0
            gap=58 if s<3 else 35
            pts=array_points(rows,cols,430,375,gap,angle)
            for i,(x,y) in enumerate(pts):dot(x,y,[blue,gold,red][(i//cols)%3],12 if s<3 else 8)
            txt(770,290,'同一批棋子一起转',29)
            txt(770,345,f'始终 {rows*cols} 颗',30)
            txt(770,400,'距离不变，没有拉伸',25)
            formula(['3 行，每行 4 颗：3 × 4 = 12','转过 90°：4 行，每行 3 颗，还是 12','6 × 7 = 7 × 6 = 42'][s-1])
        elif s==4:
            # Counterexample: no missing dot is silently filled.
            for i,(x,y) in enumerate(array_points(3,4,420,350,60)):
                if i!=11:dot(x,y,blue,12)
                else:d.ellipse((x-12,y-12,x+12,y+12),outline=red,width=3)
            txt(760,300,'最后一行只有 3 颗',28)
            txt(760,360,'完整的 3 × 4 应有 12 颗',25)
            formula('不完整的点阵：4 + 4 + 3 = 11，不能直接算成 3 × 4')
        elif s==5:
            for k,(rows,cols) in enumerate([(1,12),(2,6),(3,4)]):
                xx=260+k*370
                for x,y in array_points(rows,cols,xx,355,22):dot(x,y,blue,7)
                txt(xx-80,450,f'{rows} × {cols}',30)
            formula('12 颗：转向算同一种，有 3 种；行列分开算，有 6 种')
        elif s==6:
            for x,y in array_points(3,8,490,340,45):dot(x,y,gold,10)
            formula('24 颗摆完整长方形，转 90° 算同一种：有几种摆法？')
        elif s==7:
            for k,(rows,cols) in enumerate([(1,24),(2,12),(3,8),(4,6)]):
                cx=370 if k%2==0 else 920;cy=280+(k//2)*180
                for x,y in array_points(rows,cols,cx,cy,18):dot(x,y,blue,5)
                txt(cx-70,cy+48,f'{rows} × {cols}',27)
            formula('1 × 24、2 × 12、3 × 8、4 × 6：共 4 种')
        elif s==8:
            for row in range(4):
                for col in range(25):dot(180+col*30,255+row*60,[blue,gold][row%2],7)
            formula('4 个 25：25 + 25 + 25 + 25 = 4 × 25 = 100')
    else:raise ValueError(model)
