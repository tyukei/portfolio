const e=`
    .carousel-track {
      --shift: 100%;
    }
    .carousel-item {
      flex: 0 0 100%;
    }
    @media (min-width: 768px) {
      .carousel-track {
        --shift: 50%;
      }
      .carousel-item {
        flex: 0 0 50%;
      }
    }
    
    .nav-zone {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 15%;
      z-index: 10;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .nav-zone:hover {
      opacity: 1;
    }
    .nav-zone.left {
      left: -5%;
      background: linear-gradient(90deg, var(--bg-surface) 0%, transparent 100%);
    }
    .nav-zone.right {
      right: -5%;
      background: linear-gradient(-90deg, var(--bg-surface) 0%, transparent 100%);
    }
    .nav-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text-1);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
  `;export{e as s_6NvuGTXJ3Sc};