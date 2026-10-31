import subprocess, json, sys, os, numpy as np
IN="/root/.claude/uploads/f7572d90-b787-5132-bdc0-ea371f3dcb04/3e24b5c5-VID-20261031-WA0026.mp4"
D=os.path.dirname(os.path.abspath(__file__))
# name, src_start, output_slot_len, speed(src sec per out sec), zoom_from, zoom_to, xfade_in(d) , focus_y (0..1 for zoom centre)
EDL=json.load(open(f"{D}/edl.json"))
def run(c): subprocess.run(c,check=True)
def meanluma(path,ss,t):
    p=subprocess.run(['ffmpeg','-v','error','-ss',str(ss),'-t',str(t),'-i',path,'-vf','fps=6,scale=64:114,format=gray','-f','rawvideo','-'],capture_output=True)
    a=np.frombuffer(p.stdout,np.uint8); return a.mean()
only=sys.argv[1:] 
for i,c in enumerate(EDL["clips"]):
    if only and str(i) not in only: continue
    head=c.get("head",0); tail=c.get("tail",0)
    out_len=c["slot"]+head+tail
    sp=c["speed"]
    s0=c["src"]-head*sp
    srclen=out_len*sp
    raw=f"{D}/work/c{i}_raw.mkv"; trf=f"{D}/work/c{i}.trf"; out=f"{D}/clips/c{i}.mkv"
    m=min(1.0,max(0.0,s0))
    run(['ffmpeg','-v','error','-y','-ss',f"{s0-m:.3f}",'-i',IN,'-t',f"{srclen+2*m:.3f}",'-an','-c:v','ffv1',raw])
    run(['ffmpeg','-v','error','-y','-i',raw,'-vf',f"vidstabdetect=shakiness=6:accuracy=15:result={trf}",'-f','null','-'])
    L=meanluma(raw,m,srclen)
    tgt=c.get("luma",88)
    g=float(np.clip(np.log(tgt/255)/np.log(L/255),0.75,1.35)) if c.get("gamma",True) else 1.0
    # gamma>1 brightens in eq; we want: out=in^(1/g')... eq gamma param: higher = brighter
    eqg=1/g
    N=round(out_len*30)
    z0,z1=c["z0"],c["z1"]; fy=c.get("fy",0.5); fx=c.get("fx",0.5)
    vf=(f"vidstabtransform=input={trf}:smoothing={c.get('smooth',18)}:optzoom=1:interpol=bicubic,"
        f"hqdn3d=1.5:1.5:5:5,"
        f"trim=start={m:.3f}:duration={srclen:.3f},setpts=(PTS-STARTPTS)/{sp},")
    if sp<0.95:
        vf+="minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,fps=30,"
    else:
        vf+="fps=30,"
    vf+=(f"eq=gamma={eqg:.3f},"
         f"scale=2160:-2:flags=lanczos,crop=2160:3840,"
         f"zoompan=z='{z0}+({z1}-{z0})*on/{N}':x='(iw-iw/zoom)*{fx}':y='(ih-ih/zoom)*{fy}':d=1:s=1080x1920:fps=30,"
         f"trim=end_frame={N},setsar=1,format=yuv420p")
    run(['ffmpeg','-v','error','-y','-i',raw,'-vf',vf,'-c:v','libx264','-crf','10','-preset','medium',out])
    nf=subprocess.run(['ffprobe','-v','error','-count_frames','-select_streams','v','-show_entries','stream=nb_read_frames','-of','csv=p=0',out],capture_output=True,text=True).stdout.strip()
    print(i,c["name"],f"src={s0:.2f}+{srclen:.2f} luma={L:.0f} gamma={eqg:.2f} frames={nf}/{N}",flush=True)
