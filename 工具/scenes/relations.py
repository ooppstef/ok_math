"""数量关系动画。所有动作以实际 speech_duration 为时基，末帧保持。"""
import math


def progress(t, sc, ctx, r):
    return r.clamp((t / max(.1, ctx.get('speech_duration', ctx.get('scene_duration', sc.get('duration', 8)) - sc.get('pause_after', .6))) - .12) / .72)


def render(im, d, t, sc, ctx, r):
    p = progress(t, sc, ctx, r)
    r.header(d, ctx)
    def txt(x,y,s,size=25,color=None):
        d.text((x,y),str(s).replace('−', '-').replace('cm²', '平方厘米').replace('cm³', '立方厘米'),font=r.F(size),fill=color or r.INK)
    def line(a,b,color=None,width=3): d.line([a,b],fill=color or r.LINE,width=width)
    def dot(x,y,color=None,rad=9): d.ellipse((x-rad,y-rad,x+rad,y+rad),fill=color or r.TEAL)
    def box(x,y,w,h,color=None): d.rounded_rectangle((x,y,x+w,y+h),radius=5,fill=color or r.TEAL_BG,outline=r.TEAL,width=2)
    def eq(s): r.set_conclusion(ctx, s)
    model, stage = sc['model'], sc['stage']
    if model == 'balance':
        # Fixed pan positions; removed objects remain visible in labelled trays.
        line((180,410),(1100,410),r.INK,5)
        d.polygon([(640,410),(605,475),(675,475)],fill=r.GOLD)
        for cx in (350,930):
            line((cx,410),(cx,435),r.INK)
            line((cx-195,435),(cx+195,435),r.INK,4)
        txt(120,204,'每个袋子同样重；每个砝码为 1 个单位',25,r.MUTED)
        b = 0 if stage in ('start','question','check') else (p if stage=='remove_bag' else 1)
        w = p if stage=='remove_weights' else (1 if stage=='result' else 0)
        if b>0:
            txt(150,232,'已取下',21,r.MUTED);txt(730,232,'已取下',21,r.MUTED)
        if stage=='remove_bag': txt(470,493,'两边各拿走一袋',24,r.MUTED)
        if stage in ('remove_weights','result'): txt(460,493,'两边各拿走三个砝码',24,r.MUTED)
        for side,cx in enumerate((350,930)):
            nb=2 if side==0 else 1
            nw=3 if side==0 else 7
            for i in range(nb):
                move=b if i==0 and stage not in ('question','check') else 0
                x=cx-165+i*75; y=345-85*move
                if stage=='check':
                    for j in range(4): box(x+(j%2)*27,y+(j//2)*30,23,25,r.GOLD_BG)
                    txt(x,y-30,'4',23,r.RED)
                else:
                    box(x,y,60,70,r.GOLD_BG); txt(x+20,y+18,'x',28)
            for i in range(nw):
                move=w if i<3 else 0
                x=cx-10+i*30; y=365-105*move
                box(x,y,29,30); txt(x+8,y+1,'1',20)
        values={'start':'2x + 3 = x + 7','remove_bag':'2x + 3 − x = x + 7 − x' if p<1 else 'x + 3 = 7','remove_weights':'x + 3 − 3 = 7 − 3' if p<1 else 'x = 4','result':'x = 4','question':'把 x = 4 放回原式，两边还相等吗？','check':'2 × 4 + 3 = 4 + 7 = 11'}
        eq(values[stage])
    elif model == 'journey':
        chase=stage in ('chase','question','catch')
        if not chase:
            tm=0 if stage=='start' else (p if stage=='meet_one' else 1+2*p)
            a,b=60*tm,300-40*tm; scale=2.6
            txt(100,210,'甲 → 60 米/分',26,r.TEAL);txt(850,210,'40 米/分 ← 乙',26,r.RED)
        else:
            tm=p if stage=='chase' else (0 if stage=='question' else 5*p)
            a,b=100*tm,100+80*tm;scale=1.75
            txt(100,210,'后：快者 → 100 米/分',26,r.TEAL);txt(770,210,'前：慢者 → 80 米/分',26,r.RED)
        ox=180; ax=ox+a*scale;bx=ox+b*scale
        line((ox,390),(1110,390),r.INK,3)
        for meters in range(0,501 if chase else 301,100):
            xx=ox+meters*scale;line((xx,390),(xx,400));txt(xx-20,406,str(meters),20)
        txt(1135,405,'米',20)
        line((ox,320),(ax,320),r.TEAL,7)
        line((ox+(100 if chase else 300)*scale,355),(bx,355),r.RED,7)
        line((ax,320),(ax,390),r.LINE,2);line((bx,355),(bx,390),r.LINE,2)
        dot(ax,320,r.TEAL,13);dot(bx,355,r.RED,13)
        if bx-ax>20:
            line((ax,470),(bx,470),r.GOLD,5)
            txt((ax+bx)/2-85,481,f'间距 {b-a:.0f} 米',25,r.GOLD)
        txt(500,260,f'共同经过 {tm:.1f} 分钟',28)
        eq({'start':'初始间距 300 米','meet_one':'每分钟靠近：60 + 40 = 100 米','meet':'300 ÷ (60 + 40) = 3 分钟','chase':'每分钟缩短：100 − 80 = 20 米','question':'初始间距 100 米，几分钟追上？','catch':'100 ÷ (100 − 80) = 5 分钟'}[stage])
    elif model == 'clock':
        mins=160 if stage=='start' else (160+20*p if stage=='to_hour' else (180+25*p if stage=='to_end' else 205))
        cx,cy,rad=290,365,135
        d.ellipse((cx-rad,cy-rad,cx+rad,cy+rad),outline=r.INK,width=3)
        for i in range(60):
            a=i*math.pi/30-math.pi/2
            line((cx+(rad-8)*math.cos(a),cy+(rad-8)*math.sin(a)),(cx+(rad-18 if i%5==0 else rad-13)*math.cos(a),cy+(rad-18 if i%5==0 else rad-13)*math.sin(a)),r.MUTED)
        for i in range(1,13):
            a=i*math.pi/6-math.pi/2;txt(cx+105*math.cos(a)-10,cy+105*math.sin(a)-13,i,22)
        for angle,length,col in ((mins*6,100,r.TEAL),(mins*.5,68,r.RED)):
            a=math.radians(angle)-math.pi/2;line((cx,cy),(cx+length*math.cos(a),cy+length*math.sin(a)),col,6)
        dot(cx,cy,r.INK,7)
        whole=int(mins+.5);txt(245,515,f'{whole//60}:{whole%60:02}',27)
        x0=555;scale=12
        line((x0,350),(x0+45*scale,350),r.LINE,6)
        for delta,lab in ((0,'2:40'),(20,'3:00'),(45,'3:25')):
            xx=x0+delta*scale;line((xx,335),(xx,365),r.INK);txt(xx-30,380,lab,24)
        a=20 if stage in ('question','answer') else 0
        end=45 if stage in ('question','answer') else mins-160
        if stage!='question': line((x0+a*scale,350),(x0+end*scale,350),r.TEAL,9)
        if stage not in ('question','answer'): txt(580,440,'先到整点，再走剩下的一段',25,r.MUTED)
        eq('从 3:00 到 3:25，经过多久？' if stage=='question' else ('25 分钟；时长看两点之间的一段' if stage=='answer' else ('20 + 25 = 45 分钟' if stage=='to_end' and p==1 else f'已经过 {mins-160:.0f} 分钟')))
    elif model == 'average':
        q=0 if stage in ('start','question') else (p if stage in ('move','answer') else 1)
        original=[(j,k) for j,n in enumerate((2,4,9)) for k in range(n)]
        # The top four blocks of pile 3 move, carrying their permanent IDs.
        destinations={12:(0,2),13:(0,3),14:(0,4),11:(1,4)}
        block_w,block_h,gap=126,44,47
        base=548;centers=(196,640,1084)
        # 平均线：5 块的高度，让“移多补少”有可见的目标。
        mean_y=base-5*block_h
        for x in range(132,1180,22):
            d.line([(x,mean_y),(x+12,mean_y)],fill=r.GOLD,width=2)
        txt(702,mean_y-32,'平均线：每人 5 块',23,r.GOLD)
        for ident,(col,row) in enumerate(original):
            target=destinations.get(ident,(col,row))
            u=r.clamp(q*2) if ident in (12,13,14) else r.clamp(q*2-1)
            if ident not in destinations:u=0
            x=centers[col]-block_w/2+(centers[target[0]]-centers[col])*u
            y=base-(row+1)*block_h+(row-target[1])*block_h*u-54*math.sin(math.pi*u)
            box(x,y,block_w,block_h,r.GOLD_BG if ident in destinations else r.TEAL_BG)
            txt(x+block_w/2-10,y+9,ident+1,20)
        for i,name in enumerate('甲乙丙'):
            txt(centers[i]-12,558,name,25)
        txt(100,202,'15 块，编号始终不变；3 个人',26,r.MUTED)
        txt(100,236,'不添一块，也不丢一块',24,r.MUTED)
        eq('平均数是 5，原来每个人就有 5 块吗？' if stage=='question' else ('原来 2、4、9；平均分后每人 5' if stage=='answer' else ('总数 15 块；怎样让三个人一样多？' if stage in ('start','move') else '总数不变：15 ÷ 3 = 5')))
    elif model == 'animals':
        n=0 if stage in ('start','question','answer') else (int(p>=.4) if stage=='one' else 1+min(2,int(p*2+1e-6)))
        txt(100,207,'8 个固定位置，头数始终是 8',26,r.MUTED)
        for i in range(8):
            x=170+i*133;y=355; rabbit=i<n; c=r.GOLD if rabbit else r.TEAL
            d.ellipse((x-35,y-25,x+35,y+35),fill=c)
            dot(x,y-43,c,22)
            if rabbit:
                for off in (-12,12):d.ellipse((x+off-6,y-95,x+off+6,y-52),fill=c)
            else:d.polygon([(x+18,y-50),(x+35,y-40),(x+18,y-35)],fill=r.RED)
            legs=4 if rabbit else 2
            for j in range(legs):
                xx=x-24+j*(48/max(1,legs-1));line((xx,y+25),(xx,y+60),c,5)
            txt(x-12,450,str(i+1),24);txt(x-30,485,f'{legs} 脚',22)
        eq('如果实际有 23 只脚，能凑出来吗？' if stage=='question' else ('16 → 18 → 20 → 22 → 24：没有 23' if stage=='answer' else f'8 个头；假设有 {16+2*n} 只脚；题目要求 22 只脚'))
    elif model in ('rotate','translate'):
        for x in range(240,1081,45):line((x,210),(x,545))
        for y in range(230,546,45):line((240,y),(1080,y))
        if model=='rotate':
            ox,oy=645,365
            angle=(0 if stage in ('start','question') else (-90*p if stage=='answer' else 90*p))*math.pi/180
            pts=[(0,0),(135,0),(0,-90)]
            old=[(ox+x,oy+y) for x,y in pts];d.line(old+[old[0]],fill=r.LINE,width=3)
            deg=math.degrees(angle)
            if abs(deg)>.01:
                for radius,start in ((135,0),(90,-90)):
                    d.arc((ox-radius,oy-radius,ox+radius,oy+radius),min(start,start+deg),max(start,start+deg),fill=r.GOLD,width=3)
            new=[(ox+x*math.cos(angle)-y*math.sin(angle),oy+x*math.sin(angle)+y*math.cos(angle)) for x,y in pts]
            d.polygon(new,fill=r.TEAL_BG,outline=r.TEAL,width=4)
            for (x,y),lab in zip(new,('O','A','B')):dot(x,y);txt(x+10,y+7,lab,25)
            txt(100,210,'OA = 3 格；OB = 2 格',25)
            eq('改为逆时针 90°，A 会去哪边？' if stage=='question' else ('绕 O 逆时针 90°：A 到上边 3 格' if stage=='answer' else '绕 O 顺时针 90°：所有点同时转相同角度'))
        elif stage in ('question','answer'):
            for y in range(215,545,20):line((645,y),(645,y+10),r.RED,3)
            dot(555,365);txt(485,395,'左边 2 格',24)
            if stage=='answer':
                x=555+180*p;dot(x,365,r.GOLD);line((555,365),(x,365),r.GOLD,3)
                txt(740,395,'右边 2 格',24)
            eq('沿虚线对折，对应点在哪里？' if stage=='question' else '同一横行；两边到轴都是 2 格')
        else:
            q=0 if stage=='start' else (p if stage=='move' else 1)
            pts=[(375,500),(375,275),(465,320),(375,365)]
            d.line(pts,fill=r.LINE,width=4)
            translated=[(x+135*q,y) for x,y in pts]
            d.line(translated,fill=r.TEAL,width=6)
            for i in (0,1,2):
                x,y=translated[i];dot(x,y,r.RED);txt(x+12,y-20,'ABC'[i],24)
            eq('每个点都向右平移 3 格；形状、大小、朝向不变')
    elif model == 'inverse':
        counter=stage in ('question','answer')
        x=(4+p if counter else (3+3*p if stage=='move' else (6 if stage=='result' else 3)))
        y=6-x if counter else 12/x
        scale=65;ox,base=275,535
        box(ox,base-y*scale,x*scale,y*scale,r.GOLD_BG if counter else r.TEAL_BG)
        approx='约 ' if 0<p<1 and (counter or stage=='move') else ''
        txt(ox+x*scale/2-40,base+2,f'{approx}{x:.1f} cm',23)
        txt(ox-130,base-y*scale/2,f'{approx}{y:.2g} cm',24)
        txt(820,250,'周长固定 12 cm' if counter else '面积固定 12 cm²',27)
        if not counter:
            txt(820,310,'长 × 宽 = 12',27,r.TEAL)
            if stage in ('start','result'):
                for j in range(1,int(x)):line((ox+j*scale,base-y*scale),(ox+j*scale,base),r.TEAL,1)
                for j in range(1,int(y)):line((ox,base-j*scale),(ox+x*scale,base-j*scale),r.TEAL,1)
        elif stage=='answer':txt(820,310,'4 × 2 = 8\n5 × 1 = 5',26,r.RED)
        eq('长与宽一大一小，就成反比例吗？' if stage=='question' else ('不成：乘积变了；保持的是长 + 宽 = 6' if counter else '宽 = 12 ÷ 长；乘积不变，才是反比例'))
    elif model == 'trees':
        if stage in ('question','answer'):
            for i in range(8):
                a=i*math.pi/4; b=(i+1)*math.pi/4
                pts=[(640+145*math.cos(a+(b-a)*j/20),380+145*math.sin(a+(b-a)*j/20)) for j in range(21)]
                d.line(pts,fill=r.TEAL if i%2 else r.GOLD,width=7)
                dot(*pts[0],r.RED,9)
            txt(880,300,'周长 40 米\n每段 5 米',28)
            eq('一圈有几段？需要再加一个点吗？' if stage=='question' else '40 ÷ 5 = 8 段；闭合一圈对应 8 棵')
        else:
            q=p if stage=='close' else 0
            # Constant arc length L=800; increasing curvature bends the same rope.
            theta=max(.0001,q*2*math.pi);radius=800/theta
            def point(s):
                a=(s-.5)*theta
                return 640+radius*math.sin(a),355+radius*(1-math.cos(a))-radius*(1-math.cos(theta/2))/2
            for i in range(4):
                pts=[point((i+j/40)/4) for j in range(41)]
                d.line(pts,fill=r.TEAL if i%2 else r.GOLD,width=7)
            for i in range(5):
                x,y=point(i/4);dot(x,y,r.RED,9)
                if not (q==1 and i==4):txt(x-12,y+15,'1/5' if q==1 and i==0 else i+1,23)
            eq('四段各配右端点，还多出最左端一个点' if stage=='pair' else ('四段还在；首尾同一个位置 → 4 个位置' if stage=='close' and p==1 else '4 段路；两端都种 → 5 个位置'))
    elif model == 'water':
        # Side section is explicitly schematic; physical volume determines water rise.
        q=0 if stage=='start' else (p if stage=='immerse' else 1)
        left,right,base,unit=260,660,535,35
        stone_cy=280+170*q;stone_h=140
        # Solve A*h - submerged stone volume = initial water volume.
        lo,hi=5.,7.
        for _ in range(40):
            depth=(lo+hi)/2
            surface=base-depth*unit
            u=r.clamp((stone_cy+stone_h/2-surface)/stone_h)
            submerged=3*u*u-2*u*u*u  # Ellipsoid cap volume fraction.
            if 80*depth-160*submerged>400:hi=depth
            else:lo=depth
        depth=(lo+hi)/2
        surface=base-depth*unit
        d.rectangle((left,surface,right,base),fill=(180,215,222))
        if stage in ('layer','question','answer'):d.rectangle((left,surface,right,base-5*unit),fill=r.GOLD_BG)
        d.line([(left,220),(left,base),(right,base),(right,220)],fill=r.INK,width=5)
        d.ellipse((425,stone_cy-stone_h/2,495,stone_cy+stone_h/2),fill=r.MUTED,outline=r.INK,width=3)
        line((235,base-5*unit),(685,base-5*unit),r.RED,2)
        txt(690,base-5*unit-15,'原水深 5 cm',24)
        txt(690,255,f'当前水深 {depth:.1f} cm',26)
        txt(800,410,'内部底面 10 × 8 cm\n完全浸没 · 不吸水\n不溶解 · 不溢水',24)
        txt(780,207,'侧面示意；水量不变',24,r.MUTED)
        eq('上升层体积是多少？它对应石头的什么量？' if stage=='question' else ('80 × (7 − 5) = 160 cm³' if stage=='answer' else '底面积 80 cm²；只看上升的这一层'))
    elif model in ('view_three','view_t'):
        is_t=model=='view_t'
        blocks=[(0,0),(1,0),(2,0),(1,1)] if is_t else [(0,0),(1,0),(0,1)]
        adding=stage in ('question','answer') and not is_t
        if adding:blocks.append((1,1))
        heights=[1]*len(blocks)
        if is_t and stage in ('add','question','answer'):heights[1]=2
        if is_t and stage=='answer':heights[3]=2
        txt(100,205,'上面只看占位；前在下方；层数看立体图' if is_t else '物体位置一直保留；前在下方；每格数字是层数',25,r.MUTED)
        cell=76; ox,oy=190,340
        for i,(x,y) in enumerate(blocks):
            box(ox+x*cell,oy-y*cell,68,68,r.GOLD_BG if i==len(blocks)-1 else r.TEAL_BG)
            if not is_t:txt(ox+x*cell+24,oy-y*cell+18,heights[i],28)
        txt(190,435,'上面（位置图）',26);txt(235,473,'↓ 前',24)
        # Draw the same complete occupancy in 3D beside its orthographic views.
        # Back cells are painted first; hidden cubes remain in blocks/heights.
        az,el=math.radians(35),math.radians(30)
        if not is_t and stage=='front':az,el=math.radians(35*(1-p)),math.radians(30*(1-p))
        if not is_t and stage=='side':
            if p<.5:az,el=0,math.radians(180*p)
            else:az,el=math.radians(-90*(2*p-1)),math.radians(180*(1-p))
        def project(v):
            x,y,z=v;x-=.8;y-=.5
            return (650+68*(x*math.cos(az)-y*math.sin(az)),(445 if is_t else 405)-68*((x*math.sin(az)+y*math.cos(az))*math.sin(el)+z*math.cos(el)))
        def depth(v):
            x,y,z=v
            return (x*math.sin(az)+y*math.cos(az))*math.cos(el)-z*math.sin(el)
        faces=[]
        for i,(x,y) in enumerate(blocks):
            for z in range(heights[i]):
                moving=(is_t and ((stage=='add' and i==1 and z==1) or (stage=='answer' and i==3 and z==1))) or (not is_t and stage=='question' and i==3)
                zz=z+(1-p)*.35 if moving else z
                verts=[(x+dx,y+dy,zz+dz) for dx,dy,dz in ((0,0,0),(1,0,0),(1,1,0),(0,1,0),(0,0,1),(1,0,1),(1,1,1),(0,1,1))]
                for inds,c in [((0,1,2,3),r.TEAL_BG),((0,1,5,4),r.GOLD_BG if moving else r.TEAL_BG),((1,2,6,5),(190,210,199)),((2,3,7,6),r.TEAL_BG),((3,0,4,7),(180,196,186)),((4,5,6,7),r.PAPER)]:
                    vs=[verts[k] for k in inds]
                    faces.append((sum(depth(v) for v in vs)/4,[project(v) for v in vs],c))
        for _,points,c in sorted(faces,key=lambda f:-f[0]):d.polygon(points,fill=c,outline=r.TEAL,width=2)
        txt(550,515 if is_t else 480,'同一组方块',25)
        question=stage=='question' and not is_t
        if not question:
            if is_t:
                front=[max(heights[i] for i,(xx,yy) in enumerate(blocks) if xx==x) for x in range(3)]
                if stage=='front':front=[1,2,1]
            else:front=[1,1]
            base=345 if not is_t and stage in ('side','answer') else 420
            for x,h in enumerate(front):
                for z in range(h):box(920+x*60,base-z*60,55,55)
            txt(920,base+62,'正面'+('（目标）' if is_t and stage=='front' else ''),24)
            if not is_t and stage in ('side','answer'):
                for x in range(2):box(920+x*60,455,55,55,r.GOLD_BG)
                txt(920,518,'左面：前在左',22)
        else:txt(950,335,'？',75,r.GOLD)
        if is_t:
            eq({'start':'四个位置，每处先放一块','front':'目标正面：左 1 层、中 2 层、右 1 层','add':'前中添一块：最少 5 块','question':'最高 2 层、不悬空；还能添在哪里？','answer':'后中再添一块：最多 6 块；两张视图不变'}[stage])
        else:
            eq({'start':'3 块，都在桌面上，只有 1 层','front':'正面只看见 2 格；后左被前左挡住','side':'上面 3 个位置；左面能分清前后 2 个位置','question':'后右补 1 块；正面看到的样子会变吗？','answer':'正面仍是 2 格；上面变成 4 格，总数是 4'}[stage])
    else:
        raise ValueError(f'Unknown relations model: {model}')
    return im
