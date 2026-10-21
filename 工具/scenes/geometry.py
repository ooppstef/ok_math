"""Geometry demonstrations: all cut pieces use rigid transforms; metric geometry in pixels."""
import math


def clamp(x): return max(0.,min(1.,x))
def smooth(x):
    x=clamp(x); return x*x*(3-2*x)
def mix(a,b,p): return a+(b-a)*p
def rot(pt,ang,center=(0,0)):
    x,y=pt[0]-center[0],pt[1]-center[1]; c,s=math.cos(ang),math.sin(ang)
    return (center[0]+x*c-y*s,center[1]+x*s+y*c)
def poly(d,pts,c,r): d.polygon(pts,fill=c,outline=r.INK,width=3)
def txt(d,xy,s,r,size=25,color=None):
    s=s.replace('↔','与').replace('−','-');x,y=xy
    # Hiragino has Chinese and Greek glyphs but no superscript 2/3.
    for row in s.split('\n'):
        xx=x
        for ch in row:
            sup=ch in '²³'; face=r.F(round(size*.65) if sup else size)
            glyph={'²':'2','³':'3'}.get(ch,ch)
            d.text((xx,y-3 if sup else y),glyph,font=face,fill=color or r.INK)
            xx+=d.textlength(glyph,font=face)
        y+=round(size*1.45)

def line(d,a,b,r,col=None,w=3): d.line([a,b],fill=col or r.INK,width=w)
def dash(d,a,b,r):
    n=max(1,int(math.dist(a,b)/12))
    for i in range(n):
        if i%2==0: line(d,(mix(a[0],b[0],i/n),mix(a[1],b[1],i/n)),(mix(a[0],b[0],(i+1)/n),mix(a[1],b[1],(i+1)/n)),r,r.MUTED,2)
def right(d,x,y,r): d.line([(x,y-13),(x+13,y-13),(x+13,y)],fill=r.RED,width=2)
def progress(t,ctx,sc):
    dur=ctx.get('speech_duration',ctx.get('scene_duration',sc.get('duration',8)))
    return smooth(t/max(.1,float(dur)*.86))
def render(im,d,t,sc,ctx,r):
    r.header(d,ctx)
    txt(d,(84,122),sc.get('heading',''),r,39)
    p=progress(t,ctx,sc); stage=sc.get('stage',0)
    globals()['draw_'+sc['model']](im,d,p,stage,sc,r)
    if sc.get('equation'): txt(d,(84,565),sc['equation'],r,30,r.TEAL)


def draw_parallelogram(im,d,p,st,sc,r):
    x,y,u=330,480,48; shift=2+(p if st=='shear' else (1 if st=='shear_end' else 0))
    a=(x,y); b=(x+6*u,y); c=(x+(6+shift)*u,y-3*u); e=(x+shift*u,y-3*u); foot=(e[0],y)
    if st in ['move','done']:
        q=p if st=='move' else 1
        poly(d,[foot,b,c,e],r.TEAL_BG,r)
        poly(d,[(z[0]+6*u*q,z[1]-65*math.sin(math.pi*q)) for z in [a,foot,e]],r.GOLD_BG,r)
    else: poly(d,[a,b,c,e],r.TEAL_BG,r)
    dash(d,e,foot,r); right(d,*foot,r)
    txt(d,(e[0]+14,y-90),'高 3 厘米',r)
    txt(d,(x+95,y+17),'底 6 厘米',r)
    if st in ['shear','shear_end']: dash(d,(240,y-3*u),(980,y-3*u),r)
    if st in ['move','done']: txt(d,(800,270),'同一块\n只平移',r,27,r.GOLD)


def draw_duplicate(im,d,p,st,sc,r):
    trap=sc.get('shape')=='trapezoid'; u=40; x,y=330,480
    pts=[(0,0),(5*u,0),(4*u,-4*u),(u,-4*u)] if trap else [(0,0),(6*u,0),(2*u,-4*u)]
    pivot=(4.5*u,-2*u) if trap else (4*u,-2*u)
    poly(d,[(x+a,y+b) for a,b in pts],r.TEAL_BG,r)
    if st in ['copy','done','question','answer']:
        q=p if st=='copy' else 1
        # A new, explicitly announced copy rotates rigidly around the shared edge midpoint.
        moved=[rot(z,math.pi*q,pivot) for z in pts]
        poly(d,[(x+a,y+b) for a,b in moved],r.GOLD_BG,r)
        line(d,(x+pivot[0]-7,y+pivot[1]),(x+pivot[0]+7,y+pivot[1]),r,r.RED)
        txt(d,(850,300),'原来一块',r,25,r.TEAL); txt(d,(850,342),'再加一块',r,25,r.GOLD)
    if st=='diagonal':
        poly(d,[(x+a,y+b) for a,b in [pts[0],pts[1],pts[2]]],r.GOLD_BG,r)
        txt(d,(800,290),'5 × 4 ÷ 2 = 10',r)
        txt(d,(800,335),'3 × 4 ÷ 2 = 6',r)
    txt(d,(x+30,y+22),'下底 5 厘米' if trap else '底 6 厘米',r)
    if trap: txt(d,(x+45,y-4*u-39),'上底 3 厘米',r)
    hx=x+u if trap else x+2*u
    dash(d,(hx,y-4*u),(hx,y),r); right(d,hx,y,r)
    txt(d,(170,370),'高 4 厘米',r)
    if st=='slide':
        # replace the previous polygon cleanly on a separate region, illustrating fixed base/height
        d.rectangle((290,205,810,550),fill=r.BG)
        apex=(x+(2+4*p)*u,y-4*u)
        dash(d,(300,y-4*u),(820,y-4*u),r)
        poly(d,[(x,y),(x+6*u,y),apex],r.TEAL_BG,r)
        dash(d,apex,(apex[0],y),r); right(d,apex[0],y,r)
        txt(d,(x+60,y+20),'底 6 厘米',r); txt(d,(850,340),'高始终 4 厘米',r)


def sector_points(rad,a,b,n=20):
    return [(0,0)]+[(rad*math.cos(mix(a,b,j/n)),rad*math.sin(mix(a,b,j/n))) for j in range(n+1)]
def sector_layout(n,rad=110):
    alpha=math.pi/n; step=2*rad*math.sin(alpha); h=rad*math.cos(alpha)
    return [(660+(i//2)*step+(step/2 if i%2 else 0),330+(h if i%2 else 0),-math.pi/2 if i%2 else math.pi/2) for i in range(n)]
def draw_circle_cut(im,d,p,st,sc,r):
    n=sc.get('sectors',12); rad=110; alpha=math.pi/n
    q=p if st=='move' else (1 if st in ['done','fine'] else 0)
    volume=sc.get('volume',False)
    shapes=[]
    for i,(tx,ty,target) in enumerate(sector_layout(n,rad)):
        a=2*math.pi*i/n; mid=a+alpha
        delta=(target-mid+math.pi)%(2*math.pi)-math.pi
        pts=sector_points(rad,a,a+2*alpha)
        center=(mix(280,tx,q),mix(370,ty,q))
        pts=[rot(z,delta*q) for z in pts]
        pts=[(a+center[0],b+center[1]) for a,b in pts]
        shapes.append((pts,r.TEAL_BG if i%2==0 else r.GOLD_BG))
    if volume:
        projected=[]
        for pts,c in shapes:
            base=[(a,430+(b-370)*.55) for a,b in pts]; top=[(a,b-110) for a,b in base]
            projected.append((base,top,c))
        for base,top,c in sorted(projected,key=lambda z:sum(y for x,y in z[0])/len(z[0])):
            for j in range(len(base)):
                k=(j+1)%len(base)
                d.polygon([base[j],base[k],top[k],top[j]],fill=c)
            for j in [0,1,len(base)-1]: line(d,base[j],top[j],r,r.MUTED,1)
            poly(d,top,c,r)
        txt(d,(90,215),'每块的高 h 不变',r)
    else:
        for pts,c in shapes: poly(d,pts,c,r)
    txt(d,(130,510),f'{n} 个全等扇形'+('柱' if volume else ''),r)
    if q==1:
        txt(d,(650,490),'弧面仍在，接近长方体' if volume else '弧边仍在，只是接近长方形',r,24)
        txt(d,(720,275),'长趋近 πr',r,24)
        txt(d,(1080,380),'宽趋近 r',r,22)


def draw_perimeter(im,d,p,st,sc,r):
    if st in ['corner','corner_answer','trace']:
        if st=='trace':
            draw_perimeter(im,d,p,'done',sc,r)
            pts=[(330,330),(610,330),(610,470),(330,470),(330,330)]
            travel=p*840
            for a,b in zip(pts,pts[1:]):
                le=math.dist(a,b);q=min(1,travel/le)
                if q>0:line(d,a,(mix(a[0],b[0],q),mix(a[1],b[1],q)),r,r.RED,6)
                travel-=le
            return
        x,y,u=330,470,48
        pts=[(x,y),(x+6*u,y),(x+6*u,y-2*u),(x+4*u,y-2*u),(x+4*u,y-4*u),(x,y-4*u)]
        poly(d,pts,r.TEAL_BG,r)
        dash(d,(x+4*u,y-4*u),(x+6*u,y-4*u),r);dash(d,(x+6*u,y-4*u),(x+6*u,y-2*u),r)
        if st=='corner_answer':
            d.line([(x+6*u,y-2*u),(x+4*u,y-2*u),(x+4*u,y-4*u)],fill=r.RED,width=5)
            txt(d,(850,300),'去掉两段 2 厘米',r,26);txt(d,(850,350),'添回两段 2 厘米',r,26)
        txt(d,(400,500),'原长 6 厘米、宽 4 厘米',r,25)
        return
    s=140; x,y=330,330; gap=120*(1-p) if st=='join' else (0 if st=='done' else 120)
    for xx in [x,x+s+gap]:
        d.rectangle((xx,y,xx+s,y+s),fill=r.TEAL_BG,outline=r.INK,width=4)
        txt(d,(xx+32,y+50),'3厘米',r)
    line(d,(x+s,y),(x+s,y+s),r,r.RED,5)
    line(d,(x+s+gap,y),(x+s+gap,y+s),r,r.GOLD,5)
    txt(d,(820,330),'每个图形原来\n各有一条接缝边',r)
    if st=='done': txt(d,(350,245),'两条边都藏到里面',r,30,r.RED)


def draw_angle(im,d,p,st,sc,r):
    angle=math.radians(40+(40*p if st=='open' else (40 if st in ['rotate','rotated','right','question'] else 0)))
    le=150+100*p if st=='extend' else (150 if st=='start' else 250)
    turn=math.pi/6*p if st=='rotate' else (math.pi/6 if st=='rotated' else 0)
    o=(490,460); a=rot((o[0]+le,o[1]),-turn,o); b=rot((o[0]+le*math.cos(angle),o[1]-le*math.sin(angle)),-turn,o)
    line(d,o,a,r,r.TEAL,6); line(d,o,b,r,r.GOLD,6)
    arc=[(o[0]+60*math.cos(-turn-angle*j/40),o[1]+60*math.sin(-turn-angle*j/40)) for j in range(41)]
    d.line(arc,fill=r.RED,width=4); d.ellipse((484,454,496,466),fill=r.INK)
    txt(d,(810,330),'看两条边的开口',r,30)
    txt(d,(810,380),'边画长 ≠ 角变大',r,27)


def draw_area_grid(im,d,p,st,sc,r):
    if st in ['rearrange','strip']:
        q=p if st=='rearrange' else 1; u=29
        for k in range(30):
            x=mix(220+k%6*u,160+k*u,min(1,q*2));y=mix(280+k//6*u,360,max(0,q*2-1))
            d.rectangle((x,y,x+u,y+u),fill=r.TEAL_BG,outline=r.TEAL,width=2)
        txt(d,(170,230),'缩小视图：每格仍然是 1 平方厘米',r,26)
        txt(d,(290,495),'30 格全部保留；边界换了样子',r,27)
        return
    x,y,s=320,230,52
    count=(6+24*p) if st=='fill' else (6*p if st=='row' else (6 if st=='row_done' else 30))
    for j in range(5):
        for i in range(6):
            k=j*6+i; d.rectangle((x+i*s,y+j*s,x+(i+1)*s,y+(j+1)*s),outline=r.LINE,width=2)
            q=smooth(count-k)
            if q>0:
                # tiles arrive intact from an adjacent stack, with the same square size
                xx=x+i*s+200*(1-q); yy=y+j*s
                d.rectangle((xx,yy,xx+s,yy+s),fill=r.TEAL_BG,outline=r.TEAL,width=2)
    txt(d,(380,500),'一行 6 格',r); txt(d,(120,340),'5 行',r,30)
    txt(d,(850,285),'每格 1 平方厘米',r,26)
    txt(d,(850,335),'没有重叠，也没留空',r,24)


def draw_fixed_perimeter(im,d,p,st,sc,r):
    a,b=(4,2) if sc.get('second') else (5,1)
    x,y,u=300,460,60
    d.rectangle((x,y-b*u,x+(a-1)*u,y),fill=r.TEAL_BG,outline=r.INK,width=3)
    q=p if st=='change' else (1 if st=='done' else 0)
    removed=smooth(q*2); added=smooth(q*2-1)
    d.rectangle((x+(a-1)*u+150*removed,y-b*u,x+a*u+150*removed,y),fill=r.RED_BG,outline=r.RED,width=3)
    if added>0:
        d.rectangle((x,y-(b+1)*u-70*(1-added),x+(a-1)*u,y-b*u-70*(1-added)),fill=r.GOLD_BG,outline=r.GOLD,width=3)
    if st!='start':
        txt(d,(850,280),f'去掉 1 × {b} = {b}',r,26,r.RED)
        txt(d,(850,330),f'添上 {a-1} × 1 = {a-1}',r,26,r.GOLD)
    txt(d,(310,500),f'{a} + {b} = {a-1} + {b+1} = 6',r,29)


def draw_frame(im,d,p,st,sc,r):
    if st in ['triangle','meet']:
        a=(360,470); b=(760,470); c=(504,278)
        dash(d,(504,240),(504,520),r)
        line(d,a,b,r,r.INK,6)
        q=p if st=='meet' else 1
        ca=rot(c,(1-q)*-.6,a); cb=rot(c,(1-q)*.25,b)
        line(d,a,ca,r,r.TEAL,7); line(d,b,cb,r,r.GOLD,7)
        txt(d,(530,490),'5 厘米',r); txt(d,(345,325),'3 厘米',r); txt(d,(650,310),'4 厘米',r)
    else:
        ang=math.radians(60+25*math.sin(p*math.pi)) if st=='flex' else math.radians(60)
        a=(350,480); b=(650,480); v=(180*math.cos(ang),-180*math.sin(ang)); c=(b[0]+v[0],b[1]+v[1]); e=(a[0]+v[0],a[1]+v[1])
        if st=='brace': poly(d,[a,b,c],r.TEAL_BG,r); poly(d,[a,c,e],r.GOLD_BG,r)
        d.line([a,b,c,e,a],fill=r.INK,width=7)
        if st=='brace': line(d,a,c,r,r.RED,6)
        else: dash(d,a,c,r)
        txt(d,(900,310),'棒长固定',r,28)
        txt(d,(900,355),'接点可以转动',r,26)


def draw_angles_sum(im,d,p,st,sc,r):
    # 50°, 60°, 70° triangle, computed using intersecting rays.
    a=(290,470); b=(650,470)
    h=360/(1/math.tan(math.radians(50))+1/math.tan(math.radians(60)))
    c=(290+h/math.tan(math.radians(50)),470-h)
    verts=[a,b,c]; starts=[-50,-180,60]; widths=[50,60,70]
    if st in ['start','move']: d.line(verts+[a],fill=r.LINE,width=3)
    q=p if st=='move' else (1 if st=='done' else 0)
    target_starts=[-180,-130,-70]
    for k,(v,sta,w) in enumerate(zip(verts,starts,widths)):
        # For top corner start=60 to130 matches rays down-right and down-left.
        pts=sector_points(62,math.radians(sta),math.radians(sta+w),24)
        ang=math.radians(target_starts[k]-sta)*q
        center=(mix(v[0],850,q),mix(v[1],460,q))
        out=[rot(z,ang) for z in pts]; out=[(z[0]+center[0],z[1]+center[1]) for z in out]
        poly(d,out,[r.TEAL_BG,r.GOLD_BG,r.RED_BG][k],r)
    if st in ['question','answer']:
        d.line(verts+[a],fill=r.INK,width=3)
        txt(d,(320,435),'50°',r); txt(d,(565,435),'60°',r); txt(d,(c[0]-20,c[1]+25),'70°' if st=='answer' else '?',r)
    if st=='done': txt(d,(760,300),'合成一个平角',r,30)


def cube(d,x,y,z,s,origin,r,color=None):
    def pr(a,b,c): return (origin[0]+s*(a+.48*b),origin[1]+s*(-.27*b-c))
    v=[pr(x+a,y+b,z+c) for a,b,c in [(0,0,0),(1,0,0),(1,1,0),(0,1,0),(0,0,1),(1,0,1),(1,1,1),(0,1,1)]]
    for inds,col in [([0,1,5,4],color or r.TEAL_BG),([1,2,6,5],r.GOLD_BG),([4,5,6,7],r.PAPER)]: poly(d,[v[i] for i in inds],col,r)

def draw_volume(im,d,p,st,sc,r):
    if st in ['container','answer']:
        for z in range(3):
            for y in reversed(range(3)):
                for x in range(3): cube(d,x,y,z,54,(360,440),r)
        txt(d,(820,280),'内部长、宽、高',r,29)
        txt(d,(820,330),'各 10 厘米',r,29)
        txt(d,(820,395),'图中分线只表示层次',r,23)
        return
    count=(12*p if st=='base' else (12+48*p if st=='stack' else 60))
    for z in range(5):
        for y in reversed(range(4)):
            for x in range(3):
                k=z*12+(3-y)*3+x
                if k<count: cube(d,x,y,z,38,(350,455-55*(1-smooth(count-k))),r)
    txt(d,(800,265),'每块 1 立方厘米',r,29)
    txt(d,(800,320),'每层 3 × 4 = 12 块',r,27)
    txt(d,(800,380),'共 5 层',r,29)


def rotate3(v,axis,ang,origin=(0,0,0)):
    x,y,z=[v[i]-origin[i] for i in range(3)]; c,s=math.cos(ang),math.sin(ang)
    if axis=='x': v=(x,y*c-z*s,y*s+z*c)
    else: v=(x*c+z*s,y,-x*s+z*c)
    return tuple(v[i]+origin[i] for i in range(3))

def draw_net(im,d,p,st,sc,r):
    faces={'C':[(0,0,0),(1,0,0),(1,1,0),(0,1,0)],'B':[(-1,0,0),(0,0,0),(0,1,0),(-1,1,0)],'D':[(1,0,0),(2,0,0),(2,1,0),(1,1,0)],'E':[(2,0,0),(3,0,0),(3,1,0),(2,1,0)],'A':[(-1,-1,0),(0,-1,0),(0,0,0),(-1,0,0)],'F':[(0,1,0),(1,1,0),(1,2,0),(0,2,0)]}
    q=p if st=='sides' else (1 if st in ['close','done','question','answer'] else 0)
    v=p if st=='close' else (1 if st in ['done','question','answer'] else 0)
    def project(v):
        x,y,z=v; return (500+130*(x-.65*y),385+130*(.25*x+.35*y-z))
    assembled=[]
    for name,pts in faces.items():
        if name=='A': pts=[rotate3(a,'x',-math.pi/2*v) for a in pts]
        if name=='E': pts=[rotate3(a,'y',-math.pi/2*v,(2,0,0)) for a in pts]
        if name in ['A','B']: pts=[rotate3(a,'y',math.pi/2*q) for a in pts]
        if name in ['D','E']: pts=[rotate3(a,'y',-math.pi/2*q,(1,0,0)) for a in pts]
        if name=='F': pts=[rotate3(a,'x',math.pi/2*q,(0,1,0)) for a in pts]
        assembled.append((sum(a[0]+a[1]+a[2] for a in pts),name,[project(a) for a in pts]))
    for _,name,pts in sorted(assembled):
        # lightly tinted faces and all labeled outlines preserve the identity of hidden faces
        col={'A':r.GOLD_BG,'F':r.GOLD_BG,'B':r.RED_BG,'D':r.RED_BG,'C':r.TEAL_BG,'E':r.TEAL_BG}[name]
        poly(d,pts,col,r)
    for _,name,pts in sorted(assembled):
        d.line(pts+[pts[0]],fill=r.INK,width=2)
        xy=(sum(a for a,b in pts)/4-9,sum(b for a,b in pts)/4-16)
        txt(d,xy,name,r,27,r.TEAL if name in ['C','E'] else r.INK)
    txt(d,(860,275),'C 固定作底面',r,27)
    if st=='answer':
        txt(d,(860,330),'C ↔ E',r,30,r.TEAL);txt(d,(860,375),'B ↔ D',r,30,r.RED);txt(d,(860,420),'A ↔ F',r,30,r.GOLD)
    else: txt(d,(860,340),'沿公共边折叠\n每个面保持正方形',r,24)


def draw_circle(im,d,p,st,sc,r):
    if st=='scale':
        rad=65*(1+p);cx,cy=410,380
        d.ellipse((cx-rad,cy-rad,cx+rad,cy+rad),fill=r.TEAL_BG,outline=r.TEAL,width=4)
        line(d,(cx-rad,cy),(cx+rad,cy),r,r.GOLD,4)
        txt(d,(800,300),'直径 × 2',r,30)
        txt(d,(800,355),'圆周长也 × 2',r,30)
        txt(d,(800,410),'C ÷ d 始终等于 π',r,28)
        return
    rad=90; cx,cy=360,370
    if st in ['trace','radius']:
        end=2*math.pi*(p if st=='trace' else 1)
        pts=[(cx+rad*math.cos(end*j/180),cy+rad*math.sin(end*j/180)) for j in range(181)]
        d.line(pts,fill=r.TEAL,width=5)
        tip=(cx+rad*math.cos(end),cy+rad*math.sin(end));line(d,(cx,cy),tip,r,r.RED,4)
        d.ellipse((cx-5,cy-5,cx+5,cy+5),fill=r.INK)
        txt(d,(650,290),'圆心固定',r,30);txt(d,(650,345),'到圆心的距离始终等于 r',r,28)
    else:
        q=p if st=='unroll' else 1
        rad=65; length=2*math.pi*rad; k=(1-q)/rad
        pts=[]
        for j in range(241):
            s=length*j/240
            xx=s if k<1e-8 else math.sin(k*s)/k
            yy=0 if k<1e-8 else (1-math.cos(k*s))/k
            pts.append((380+xx,510-yy))
        d.line(pts,fill=r.TEAL,width=6)
        line(d,(900,420),(1030,420),r,r.GOLD,6)
        txt(d,(925,440),'直径 d',r,23)
        if q==1:
            for i in range(4): line(d,(380+130*i,500),(380+130*i,520),r,r.RED,2)
            txt(d,(520,275),'圆周长略多于 3 个直径',r,29)
            txt(d,(520,325),'π ≈ 3.14，不是精确 3.14',r,27)


def draw_cylinder_surface(im,d,p,st,sc,r):
    if st=='answer':
        # Same radius and height in every comparison; only cap count differs.
        # The drawn rectangle length is exactly the circumference of each cap.
        rad=32; width=2*math.pi*rad; height=100
        for i,(name,ncaps) in enumerate([('有盖：2 个底面',2),('无盖：1 个底面',1),('两端开口：0 个底面',0)]):
            x=150+i*365; y=345
            txt(d,(x-10,215),name,r,25)
            d.rectangle((x,y,x+width,y+height),fill=r.TEAL_BG,outline=r.TEAL,width=3)
            txt(d,(x+48,y+33),'侧面',r,25)
            for j in range(ncaps):
                # Separate actual circular regions remain countable beside their side panel.
                cx=x+width/2;cy=285 if j==0 else 493
                d.ellipse((cx-rad,cy-rad,cx+rad,cy+rad),fill=r.GOLD_BG,outline=r.GOLD,width=3)
                txt(d,(cx-13,cy-17),str(j+1),r,25)
        txt(d,(135,532),'同样的侧面，按实际保留的圆形底面计算',r,24,r.MUTED)
        return
    # An intrinsically isometric sheet: material coordinate s follows a circle whose
    # curvature falls continuously to zero. Each vertical generator retains height.
    q=p if st=='unroll' else (1 if st in ['flat','question','answer'] else 0)
    L=420; k=(1-q)*2*math.pi/L; h=130
    def xy(s,z):
        xx=s if k<1e-8 else math.sin(k*s)/k
        depth=0 if k<1e-8 else (1-math.cos(k*s))/k
        return (380+xx+.35*depth,450-.32*depth-z)
    panels=[]
    for j in range(80):
        a,b=L*j/80,L*(j+1)/80
        ps=[xy(a,0),xy(b,0),xy(b,h),xy(a,h)]
        panels.append((sum(v[1] for v in ps),ps))
    for _,ps in sorted(panels): d.polygon(ps,fill=r.TEAL_BG)
    for z in [0,h]: d.line([xy(L*j/160,z) for j in range(161)],fill=r.GOLD,width=5)
    for s in [0,L]: line(d,xy(s,0),xy(s,h),r,r.RED,4)
    for s in [L*j/12 for j in range(13)]: line(d,xy(s,0),xy(s,h),r,r.LINE,1)
    txt(d,(870,300),'剪开的一条高',r,26,r.RED)
    txt(d,(870,345),'展开后成为两侧',r,26)
    if q==1:
        txt(d,(480,460),'长 = 底面周长 C',r,27)
        txt(d,(235,345),'高 h',r,27)
    if st=='caps':
        d.ellipse((880,230,1010,360),fill=r.GOLD_BG,outline=r.INK,width=3)
        d.ellipse((880,390,1010,520),fill=r.GOLD_BG,outline=r.INK,width=3)


def cylinder(d,x,y,w,h,r,level=None):
    ry=w*.18
    if level is not None and level>0:
        yh=y+h*(1-level)
        d.rectangle((x,yh,x+w,y+h),fill=r.TEAL_BG)
        d.ellipse((x,yh-ry,x+w,yh+ry),fill=r.TEAL_BG,outline=r.TEAL,width=2)
    d.ellipse((x,y-ry,x+w,y+ry),outline=r.INK,width=3)
    line(d,(x,y),(x,y+h),r); line(d,(x+w,y),(x+w,y+h),r)
    d.arc((x,y+h-ry,x+w,y+h+ry),0,180,fill=r.INK,width=3)

def draw_cone(im,d,p,st,sc,r):
    if st in ['same_height_question','same_height_answer']:
        top,base=290,490
        # Side profiles are explicitly not to scale: base dimensions are unknown.
        txt(d,(160,210),'只知道同高；底面尺寸未知，示意图不按尺寸比例绘制',r,25,r.MUTED)
        dash(d,(250,top),(1000,top),r);dash(d,(250,base),(1000,base),r)
        left,right=310,470;mid=(left+right)/2
        d.line([(left,top),(mid,base),(right,top)],fill=r.INK,width=3)
        d.ellipse((left,top-25,right,top+25),outline=r.INK,width=3)
        cylinder(d,730,top,210,base-top,r)
        line(d,(570,top),(570,base),r,r.RED,3)
        txt(d,(588,370),'同高 h',r,26,r.RED)
        txt(d,(280,520),'底面积：未知',r,26)
        txt(d,(740,520),'底面积：未知',r,26)
        if st=='same_height_answer':
            txt(d,(980,340),'先查底面',r,25,r.RED)
            txt(d,(980,385),'再算体积',r,25,r.RED)
        return
    idx=sc.get('pour',0); level=(idx+p)/3 if st=='pour' else (1 if st=='done' else 0)
    cylinder(d,730,275,170,210,r,level)
    for j in [1,2]: dash(d,(730,275+210*j/3),(900,275+210*j/3),r)
    # Upright conical source. Filled volume fraction f => water depth f^(1/3)
    # in a cone with the tip down, so source water and target level track volume.
    left,right,top,tip=300,470,275,485
    d.line([(left,top),((left+right)/2,tip),(right,top)],fill=r.INK,width=3)
    if st=='pour':
        f=1-p; dep=210*f**(1/3); half=85*f**(1/3)
        poly(d,[((left+right)/2,tip),((left+right)/2-half,tip-dep),((left+right)/2+half,tip-dep)],r.TEAL_BG,r)
        if p<.98:
            line(d,(505,365),(675,365),r,r.TEAL,5)
            poly(d,[(675,365),(660,356),(660,374)],r.TEAL,r)
            txt(d,(520,320),'水量转移',r,22,r.TEAL)
    d.ellipse((left,top-30,right,top+30),outline=r.INK,width=3)
    txt(d,(250,520),'内部等底、等高',r,28)
    txt(d,(710,520),f'第 {idx+1} 份' if st=='pour' else ('等高的圆柱' if st=='start' else '三份装满'),r,28)
    txt(d,(170,210),'动画按已知结论示意；不是测量或普遍证明',r,25,r.RED)


def draw_scale(im,d,p,st,sc,r):
    sx=1+p if st=='scale' else (2 if st in ['done','question','answer'] else (1+3*p if st=='stretch' else (4 if st=='stretch_done' else 1)))
    sy=1+p if st=='scale' else (2 if st in ['done','question','answer'] else 1)
    x,y,w,h=330,490,150,100
    d.rectangle((x,y-h*sy,x+w*sx,y),fill=r.TEAL_BG,outline=r.TEAL,width=4)
    if st in ['done','question','answer']:
        line(d,(x+w,y-h*sy),(x+w,y),r);line(d,(x,y-h),(x+w*sx,y-h),r)
    txt(d,(900,230),'原图长 3、宽 2',r,25)
    txt(d,(900,275),'单位：厘米',r,25)
    if st=='stretch_done': txt(d,(900,320),'只改一个方向\n形状改变',r,26,r.RED)
    elif st=='stretch': txt(d,(900,320),'长 × 4，宽 × 1',r,24,r.RED)
    else: txt(d,(900,320),'两个方向同比改变',r,24)


def draw_solid_cut(im,d,p,st,sc,r):
    q=p if st=='cut' else (1-p if st=='join' else (1 if st in ['done','question','answer'] else 0))
    s=36; sep=90*q
    # Two rigid 4×4×3 prisms, shown with the newly exposed faces in red.
    def prism(x0,w,origin,cutside):
        def pr(x,y,z): return (origin[0]+s*(x+.45*y),origin[1]+s*(-.32*y-z))
        a,b,c,e=[pr(x,y,0) for x,y in [(x0,0),(x0+w,0),(x0+w,4),(x0,4)]]
        A,B,C,E=[pr(x,y,3) for x,y in [(x0,0),(x0+w,0),(x0+w,4),(x0,4)]]
        poly(d,[a,b,B,A],r.TEAL_BG,r);poly(d,[b,c,C,B],r.RED_BG if cutside=='right' and q else r.GOLD_BG,r);poly(d,[A,B,C,E],r.GOLD_BG,r)
        if cutside=='left' and q:
            poly(d,[a,e,E,A],r.RED_BG,r)
            d.line([a,e,E,A,a],fill=r.RED,width=4)
        if cutside=='right' and q: d.line([b,c,C,B,b],fill=r.RED,width=4)
    prism(0,4,(300-sep,440),'right');prism(4,4,(300+sep,440),'left')
    txt(d,(900,290),'原木块：8 × 4 × 3',r,24)
    txt(d,(900,335),'每个新面：4 × 3',r,24,r.RED)
    txt(d,(900,380),'单位：厘米',r,24)
    txt(d,(290,215),'透明观察：追踪刀口两侧的新面',r,25)
    txt(d,(290,510),'忽略切割损耗，每块都完整保留',r,25)


def draw_cylinder_layer(im,d,p,st,sc,r):
    q=p if st=='grow' else 0
    x,y,w,h=370,310,200,170
    cylinder(d,x,y,w,h,r)
    # Added slab is a distinct volume, not a stretched original cylinder.
    if q>0:
        depth=34*q
        d.rectangle((x,y-depth,x+w,y),fill=r.GOLD_BG)
        d.ellipse((x,y-depth-w*.18,x+w,y-depth+w*.18),fill=r.GOLD_BG,outline=r.GOLD,width=3)
        line(d,(x,y-depth),(x,y),r,r.GOLD,3);line(d,(x+w,y-depth),(x+w,y),r,r.GOLD,3)
    txt(d,(730,285),'底面积 12 平方厘米',r,28)
    txt(d,(730,340),'原高 5 厘米',r,28)
    txt(d,(730,395),'再添 1 厘米高的一层',r,28,r.GOLD)


def draw_circle_area_scale(im,d,p,st,sc,r):
    # A fixed reference makes the doubled radius an actual metric change.
    q=1 if st=='question' else p
    for cx,rad,label in [(300,60,'原圆'),(760,60*(1+q),'半径变为两倍')]:
        cy=380
        d.ellipse((cx-rad,cy-rad,cx+rad,cy+rad),fill=r.TEAL_BG,outline=r.TEAL,width=4)
        line(d,(cx,cy),(cx+rad,cy),r,r.RED,4)
        line(d,(cx,cy),(cx,cy-rad),r,r.GOLD,4)
        lab='r' if cx==300 or q==0 else ('2r' if q==1 else f'{1+q:.1f}r')
        txt(d,(cx+rad/2-10,cy+7),lab,r,26,r.RED)
        txt(d,(cx+8,cy-rad/2-20),lab,r,26,r.GOLD)
        txt(d,(cx-70,220),label,r,27)
    if st=='question':
        txt(d,(250,480),'面积 S',r,27)
        txt(d,(700,515),'面积是几倍？',r,27)
    elif p>=.98:
        txt(d,(250,480),'面积 S',r,27)
        txt(d,(710,515),'面积 4S',r,30,r.TEAL)
        txt(d,(960,325),'两个半径',r,26)
        txt(d,(960,370),'各乘一次 2',r,26)
