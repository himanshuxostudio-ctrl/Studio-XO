import numpy as np, scipy.signal as ss, scipy.io.wavfile as wf, os
SR=48000; BPM=100; B=60/BPM; DUR=18.0; N=int(SR*DUR)
rng=np.random.default_rng(31)
L=np.zeros(N); R=np.zeros(N)          # dry bus
RV_L=np.zeros(N); RV_R=np.zeros(N)    # reverb send
def mf(m): return 440*2**((m-69)/12)
def put(sig,t,gain=1.0,pan=0.0,rev=0.0):
    i=int(t*SR); 
    if i>=N: return
    s=sig[:N-i]*gain; gl=np.cos((pan+1)*np.pi/4); gr=np.sin((pan+1)*np.pi/4)
    L[i:i+len(s)]+=s*gl; R[i:i+len(s)]+=s*gr
    RV_L[i:i+len(s)]+=s*gl*rev; RV_R[i:i+len(s)]+=s*gr*rev
def tt(d): return np.arange(int(d*SR))/SR
def lp(x,f,o=2): return ss.sosfilt(ss.butter(o,f,'low',fs=SR,output='sos'),x)
def hp(x,f,o=2): return ss.sosfilt(ss.butter(o,f,'high',fs=SR,output='sos'),x)
def bp(x,a,b,o=2): return ss.sosfilt(ss.butter(o,[a,b],'band',fs=SR,output='sos'),x)

# ---------- instruments ----------
def musicbox(m,d=2.2):
    t=tt(d); f=mf(m); s=np.zeros_like(t)
    for r,a,dec in [(1,1,2.2),(2.0,.35,3.5),(3.0,.12,5),(4.07,.18,7),(6.8,.06,10)]:
        s+=a*np.sin(2*np.pi*f*r*t*(1+0.0025*np.sin(2*np.pi*4.5*t)))*np.exp(-dec*t)  # slight eerie wow
    return s*np.minimum(1,t/0.002)
def bell(m,d=5):
    t=tt(d); f=mf(m); s=np.zeros_like(t)
    for r,a,dec in [(0.5,.5,0.6),(1,1,0.9),(1.19,.4,1.4),(1.56,.3,1.8),(2.0,.35,1.2),(2.74,.2,2.5),(3.76,.12,3.5)]:
        s+=a*np.sin(2*np.pi*f*r*t)*np.exp(-dec*t)
    return s*np.minimum(1,t/0.003)
def pluck(m,d=0.6):
    t=tt(d); f=mf(m); s=np.zeros_like(t)
    for k in range(1,14):
        if f*k>9000: break
        s+=(1/k)*np.sin(2*np.pi*f*k*t+rng.uniform(0,6))*np.exp(-(5+k*2.2)*t)
    return s*np.minimum(1,t/0.002)
def pad(notes,d,cut=1400,att=0.8,rel=1.2):
    t=tt(d); s=np.zeros_like(t)
    for m in notes:
        for det in (-0.12,0,0.11):
            f=mf(m+det)
            for k in range(1,40):
                if f*k>cut*2.5: break
                s+=(1/k)*np.sin(2*np.pi*f*k*t+rng.uniform(0,6))
    s=lp(s,cut,4)
    env=np.minimum(1,t/att)*np.minimum(1,(d-t)/rel).clip(0,1)
    s*=env*(1+0.15*np.sin(2*np.pi*0.3*t))
    return s/ (len(notes)*3*2.5)
def braam(notes,d=3.0):
    t=tt(d); s=np.zeros_like(t)
    fc=180+2600*(1-np.exp(-t/0.25))*np.exp(-t/1.6)+120
    for m in notes:
        for det in (-0.08,0.0,0.09):
            f=mf(m+det)
            for k in range(1,120):
                if f*k>6000: break
                s+=(1/k)/(1+(f*k/fc)**4)*np.sin(2*np.pi*f*k*t+rng.uniform(0,6))
    s=np.tanh(1.6*s/len(notes)/2)
    env=np.minimum(1,t/0.03)*np.exp(-t/1.4)
    return s*env
def sub(f0=62,f1=30,d=2.5,dec=0.9):
    t=tt(d); f=f1+(f0-f1)*np.exp(-t*3); ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t/dec)*np.minimum(1,t/0.004)
def kick(d=0.5):
    t=tt(d); f=45+110*np.exp(-t*28); ph=2*np.pi*np.cumsum(f)/SR
    s=np.sin(ph)*np.exp(-t*7)+0.3*hp(rng.standard_normal(len(t)),2000)*np.exp(-t*120)
    return np.tanh(1.4*s)
def heartbeat():
    out=np.zeros(int(0.8*SR)); k=lp(kick(0.5),300); out[:len(k)]+=k; i=int(0.17*SR); out[i:i+len(k)]+=0.65*k[:len(out)-i]; return out
def clap(d=0.6):
    t=tt(d); n=bp(rng.standard_normal(len(t)),900,4500)
    env=np.exp(-t*18)
    for o in (0.0,0.011,0.023): env+=np.where(t>o,np.exp(-(t-o)*160),0)*0.6
    return n*env*0.6+0.25*np.sin(2*np.pi*190*t)*np.exp(-t*25)
def tick(d=0.08):
    t=tt(d); return hp(rng.standard_normal(len(t)),7000)*np.exp(-t*90)
def taiko(d=1.6):
    t=tt(d); f=55+50*np.exp(-t*12); ph=2*np.pi*np.cumsum(f)/SR
    return np.tanh(1.5*(np.sin(ph)*np.exp(-t*3.2)+0.5*lp(rng.standard_normal(len(t)),900)*np.exp(-t*30)))
def revcym(d):
    t=tt(d); n=hp(rng.standard_normal(len(t)),3000); return n*(t/d)**3.5
def riser(d):
    t=tt(d); s=np.zeros_like(t); n=rng.standard_normal(len(t))
    # moving bandpass by blocks
    blk=1024
    for i in range(0,len(t),blk):
        fc=300*2**(5*(i/len(t)))
        seg=n[i:i+blk]; s[i:i+blk]=bp(seg,fc*0.7,min(fc*1.4,20000))
    f=mf(50)*2**(2*t/d); tone=np.sin(2*np.pi*np.cumsum(f)/SR)
    return (s*1.2+0.25*tone)*(t/d)**2.2
def drone(d):
    t=tt(d); s=np.zeros_like(t)
    for m,a in [(38,1),(50,.7),(57,.35),(62,.15)]:
        f=mf(m); s+=a*(np.sin(2*np.pi*f*t)+0.3*np.sin(2*np.pi*2*f*1.003*t))
    s*= (1+0.35*np.sin(2*np.pi*0.21*t))
    s+=0.15*lp(rng.standard_normal(len(t)),250)
    return s

beat=lambda b:b*B
# ---------- arrangement ----------
# drone: whole piece, fades
dr=drone(DUR); env=np.minimum(1,tt(DUR)/0.6); env[int(16.4*SR):]*=np.linspace(1,0,N-int(16.4*SR))**1.5
put(hp(dr,70,1)*env,0,0.06,0,0.15)
# HOOK hit at 0
put(sub(70,32,3,1.1),0,0.45); put(bell(74,6),0,0.34,-0.2,0.6); put(taiko(),0,0.45,0,0.4)
put(revcym(0.0001) if False else np.zeros(1),0)
# music box melody (beats, midi, gain)
mel=[(0.5,81),(1.5,77),(2.0,74),(2.5,76),(3.0,77),(3.5,73),
     (4,74),(5,81),(5.5,82),(6,81),(7,77),(7.5,76),
     (8,74),(9,77),(9.5,81),(10,86),(11,85),(11.5,81),
     (12,82),(13,81),(14,77),(15,76),(16,77),(17,76),(18,73),(19,76)]
for b,m in mel:
    g=0.30 if b<12 else 0.15
    put(musicbox(m),beat(b),g,0.35*np.sin(b),0.55)
# pads
chords=[(0,8,[50,53,57]),(8,10,[46,50,53]),(10,12,[45,49,52]),
        (12,14,[50,53,57]),(14,16,[46,50,53]),(16,18,[43,46,50]),(18,20.5,[45,49,52,57])]
for b0,b1,ns in chords:
    g=0.20 if b0<12 else 0.24
    put(pad(ns,beat(b1-b0)+0.6,cut=900 if b0<12 else 1800,att=0.9 if b0==0 else 0.25,rel=0.6),beat(b0),g,0,0.35)
# DESCENT: heartbeat every 2 beats, accent thuds on cuts
for b in (4,6,8,10):
    put(heartbeat(),beat(b),0.42,0,0.1)
for b in (6,8,10): put(sub(55,35,1.0,0.35),beat(b),0.15)
put(revcym(1.2),beat(12)-1.2,0.10,0,0.2)
# REVEAL: b12-20.5 rhythm
for b in np.arange(12,20.5,1): put(kick(),beat(b),0.40,0,0.05)
for b in np.arange(13,20.5,2): put(clap(),beat(b),0.30,0,0.5)
for i,b in enumerate(np.arange(12,20.5,0.25)): put(tick(),beat(b),0.05+(0.03 if i%2 else 0),0.4*(-1)**i,0.1)
arp={12:[62,65,69,74],14:[58,62,65,70],16:[55,58,62,67],18:[57,61,64,69],20:[57,61,64,69]}
pat=[0,1,2,3,2,1,2,3]
for b in np.arange(12,20.5,0.25):
    ch=arp[int(b//2*2)]; idx=pat[int(round((b-12)*4))%8]
    put(pluck(ch[idx]),beat(b),0.22,0.5*np.sin(b*3),0.35)
for b in (15,17,19): put(taiko(),beat(b),0.45,0,0.35); put(bell(86 if b!=19 else 85,3),beat(b),0.06,0.3,0.6)
# riser + pause before drop (b19 -> b21)
put(riser(beat(2)-0.25),beat(19),0.22,0,0.3)
put(revcym(1.0),beat(21)-1.0-0.25,0.12,0,0.3)
# CLIMAX b21: braam + sub + drums
put(braam([38,50,57,62],3.6),beat(21),0.55,0,0.5)
put(sub(65,30,3,1.2),beat(21),0.5); put(taiko(),beat(21),0.6,0,0.5)
put(pad([62,65,69,74],beat(3)+0.4,cut=2400,att=0.05,rel=0.3),beat(21),0.26,0,0.5)
for b in (21,22,22.5,23,23.5,23.75): put(kick(),beat(b),0.45,0,0.1); 
for b in (22,23): put(clap(),beat(b),0.35,0,0.5)
for b in np.arange(21,24,0.25): put(tick(),beat(b),0.06,0.4*np.sin(b*7),0.1)
for b,m in [(21,74),(21.5,77),(22,81),(22.5,77),(23,82),(23.5,81)]: put(pluck(m+12),beat(b),0.16,0.3*np.sin(b*5),0.5)
put(revcym(1.6),beat(24)-1.6,0.14,0,0.3)
# FINAL b24: impact then haunting resolve
put(braam([38,45,50,57],4.5),beat(24),0.45,0,0.6); put(sub(60,28,4,1.6),beat(24),0.5); put(taiko(2.5),beat(24),0.55,0,0.6)
put(bell(74,6),beat(24),0.32,-0.2,0.8)
for b,m,g in [(25,86,.12),(26,81,.11),(26.5,77,.1),(27,76,.09),(27.5,73,.09),(28,74,.13)]:
    put(musicbox(m,3.0),beat(b),g*2.2,0.3*np.sin(b),0.7)
put(bell(62,4.5),beat(28),0.18,0,0.8)

# ---------- reverb ----------
def ir(seed,d=3.2):
    r=np.random.default_rng(seed); t=tt(d); n=r.standard_normal(len(t))*np.exp(-t*2.2)
    n=lp(n,6000); n[:int(0.02*SR)]*=np.linspace(0,1,int(0.02*SR)); return n/np.sqrt((n**2).sum())
wl=ss.fftconvolve(RV_L,ir(1))[:N]; wr=ss.fftconvolve(RV_R,ir(2))[:N]
mixL=L+wl*1.1; mixR=R+wr*1.1
mix=np.stack([mixL,mixR],1)
auto=np.interp(np.arange(N)/SR,[0,1.8,2.4,7.0,7.2,12.3,12.6,18],[1,0.85,0.66,0.7,0.8,0.88,1.0,1.0])
mix*=auto[:,None]
# ending: smooth fade over last 1.4s to true silence
fade=np.ones(N); s0=int((DUR-1.4)*SR); fade[s0:]=np.cos(np.linspace(0,np.pi/2,N-s0))**2
mix*=fade[:,None]
# opening micro fade-in (no click)
mix[:96]*=np.linspace(0,1,96)[:,None]
# bus: gentle compression (RMS follower) + soft clip
rms=np.sqrt(lp((mix**2).mean(1),8,1).clip(1e-9))
gain=np.where(rms>0.25,(0.25/rms)**0.4,1.0)
mix*=gain[:,None]
mix=hp(mix.T,28).T
mix=np.tanh(mix*1.2)/1.2
mix/=np.abs(mix).max()/0.89
wf.write(os.path.join(os.path.dirname(os.path.abspath(__file__)),'score.wav'),SR,(mix*32767).astype(np.int16))
print("ok",mix.shape[0]/SR)
